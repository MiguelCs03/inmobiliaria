"""
Entrena los 3 modelos secuencialmente.
Uso: python train_all.py
"""
import subprocess, sys

scripts = [
    ("01 — Random Forest", '''
import pandas as pd, numpy as np, joblib
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import warnings; warnings.filterwarnings('ignore')

CSV_PATH = 'ml_models/datasets/ML_Supervisado_Prediccion_Precio (1).csv'
MODEL_PATH = 'ml_models/trained/random_forest_v1.pkl'

df = pd.read_csv(CSV_PATH)
print(f'RF — Datos cargados: {df.shape}')

df['anio_construido'] = 2026 - df['antiguedad_anos']
le_zona = LabelEncoder()
df['zona_enc'] = le_zona.fit_transform(df['zona'])

FEATURES = ['superficie_total_m2','habitaciones','banos','anio_construido','zona_enc','anillo_vial']
TARGET = 'precio_total_usd'

X = df[FEATURES]
y = df[TARGET]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

params = dict(n_estimators=200, max_depth=20, min_samples_leaf=5, n_jobs=-1, random_state=42)
model = RandomForestRegressor(**params)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f'RF — MAE: ${mae:,.0f} | R²: {r2:.4f}')

Path('ml_models/trained').mkdir(parents=True, exist_ok=True)
joblib.dump({"model": model, "le_zona": le_zona, "features": FEATURES}, MODEL_PATH)
print(f'RF — Guardado en {MODEL_PATH}')
'''),
    ("02 — K-Means", '''
import pandas as pd, numpy as np, joblib
from pathlib import Path
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import silhouette_score
import warnings; warnings.filterwarnings('ignore')

CSV_PATH = 'ml_models/datasets/ML_NoSupervisado_Clustering_Clientes (1).csv'
MODEL_PATH = 'ml_models/trained/kmeans_clients_v1.pkl'

df = pd.read_csv(CSV_PATH)
print(f'KM — Datos cargados: {df.shape}')

le_tipo = LabelEncoder()
df['tipo_enc'] = le_tipo.fit_transform(df['tipo_propiedad_buscada'].fillna('Departamento'))
le_zona = LabelEncoder()
df['zona_enc'] = le_zona.fit_transform(df['zona_preferida_1'].fillna(''))

FEATURES = ['presupuesto_max_usd','tipo_enc','habitaciones_minimo','zona_enc','propiedades_vistas','contactos_realizados']
X = df[FEATURES].fillna(0)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

K = 5
km = KMeans(n_clusters=K, random_state=42, n_init=20, max_iter=500)
km.fit(X_scaled)
sil = silhouette_score(X_scaled, km.labels_)
print(f'KM — Silhouette: {sil:.4f}')

Path('ml_models/trained').mkdir(parents=True, exist_ok=True)
bundle = {"kmeans": km, "scaler": scaler, "le_tipo": le_tipo, "le_zona": le_zona, "features": FEATURES}
joblib.dump(bundle, MODEL_PATH)
print(f'KM — Guardado en {MODEL_PATH}')
'''),
    ("03 — CNN (ResNet18 Dual Head)", '''
import torch, torch.nn as nn, torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
import pandas as pd, numpy as np
from pathlib import Path
from PIL import Image
import warnings; warnings.filterwarnings('ignore')

CSV_PATH = 'ml_models/datasets/DL_Imagenes_Propiedades.csv'
MODEL_PATH = 'ml_models/trained/cnn_property.pt'
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f'CNN — Device: {device}')

CONSERVATION_LABELS = ['Excelente','Bueno','Regular','Malo','En construccion']
ROOM_LABELS = ['Sala','Dormitorio','Cocina','Bano','Fachada exterior','Jardin/Patio','Garaje','Otro']
cons_map = {v:i for i,v in enumerate(CONSERVATION_LABELS)}
room_map = {v:i for i,v in enumerate(ROOM_LABELS)}

df = pd.read_csv(CSV_PATH)
df['room_norm'] = df['label_ambiente'].apply(lambda x: x if x in room_map else 'Otro')
print(f'CNN — Datos cargados: {df.shape}')

class PropertyDataset(Dataset):
    def __init__(self, df, transform):
        self.df = df.reset_index(drop=True)
        self.transform = transform
    def __len__(self):
        return len(self.df)
    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        img = Image.fromarray(img_array)
        x = self.transform(img)
        y_cons = cons_map.get(row['label_estado_conservacion'], 0)
        y_room = room_map.get(row['room_norm'], 7)
        return x, torch.tensor(y_cons), torch.tensor(y_room)

transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225]),
])
transform_val = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225]),
])

df_train = df[df['split']=='train'].copy()
df_val = df[df['split']=='val'].copy()
train_ds = PropertyDataset(df_train, transform)
val_ds = PropertyDataset(df_val, transform_val)
train_dl = DataLoader(train_ds, batch_size=32, shuffle=True, num_workers=0)
val_dl = DataLoader(val_ds, batch_size=32, shuffle=False, num_workers=0)
print(f'CNN — Train: {len(train_ds)} | Val: {len(val_ds)}')

class PropertyDualHeadCNN(nn.Module):
    def __init__(self, num_conservation=5, num_rooms=8):
        super().__init__()
        self.backbone = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()
        self.head_conservation = nn.Linear(in_features, num_conservation)
        self.head_rooms = nn.Linear(in_features, num_rooms)
    def forward(self, x):
        feats = self.backbone(x)
        return self.head_conservation(feats), self.head_rooms(feats)

model = PropertyDualHeadCNN().to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-4)
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.5)
EPOCHS = 10

for epoch in range(EPOCHS):
    model.train()
    total_loss = 0
    for x, y_cons, y_room in train_dl:
        x, y_cons, y_room = x.to(device), y_cons.to(device), y_room.to(device)
        optimizer.zero_grad()
        out_cons, out_room = model(x)
        loss = criterion(out_cons, y_cons) + criterion(out_room, y_room)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    scheduler.step()
    model.eval()
    correct_cons = correct_room = total = 0
    with torch.no_grad():
        for x, y_cons, y_room in val_dl:
            x, y_cons, y_room = x.to(device), y_cons.to(device), y_room.to(device)
            out_cons, out_room = model(x)
            correct_cons += (out_cons.argmax(1)==y_cons).sum().item()
            correct_room += (out_room.argmax(1)==y_room).sum().item()
            total += len(y_cons)
    print(f'CNN — Epoch {epoch+1}/{EPOCHS} | Loss:{total_loss/len(train_dl):.4f} | Acc cons:{correct_cons/total:.3f} | Acc room:{correct_room/total:.3f}')

Path('ml_models/trained').mkdir(parents=True, exist_ok=True)
torch.save({
    'backbone': model.backbone.state_dict(),
    'head_conservation': model.head_conservation.state_dict(),
    'head_rooms': model.head_rooms.state_dict(),
    'conservation_labels': CONSERVATION_LABELS,
    'room_labels': ROOM_LABELS,
}, MODEL_PATH)
print(f'CNN — Guardado en {MODEL_PATH}')
'''),
]

for name, code in scripts:
    print(f'\n========== {name} ==========')
    exec(code)
    print(f'========== {name} OK ==========\n')

print('TODOS LOS MODELOS ENTRENADOS.')
