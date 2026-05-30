import argparse, os, sys
from pathlib import Path

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, Input
from tensorflow.keras.preprocessing.image import load_img, img_to_array

ROOM_LABELS = [
    'Sala', 'Cocina', 'Dormitorio_principal', 'Dormitorio_secundario',
    'Bano', 'Fachada_exterior', 'Jardin', 'Garage', 'Terraza',
    'Comedor', 'Pasillo', 'Lavanderia',
]
CONSERV_LABELS = ['Excelente', 'Bueno', 'Regular']
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 50

def build_model(num_rooms, num_conserv):
    inputs = Input(shape=(*IMG_SIZE, 3))
    x = layers.Rescaling(1./255)(inputs)
    x = layers.Conv2D(32, 3, activation='relu', padding='same')(x)
    x = layers.MaxPooling2D()(x)
    x = layers.Conv2D(64, 3, activation='relu', padding='same')(x)
    x = layers.MaxPooling2D()(x)
    x = layers.Conv2D(128, 3, activation='relu', padding='same')(x)
    x = layers.MaxPooling2D()(x)
    x = layers.Conv2D(256, 3, activation='relu', padding='same')(x)
    x = layers.MaxPooling2D()(x)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.4)(x)
    out_room = layers.Dense(num_rooms, activation='softmax', name='ambiente')(x)
    out_conserv = layers.Dense(num_conserv, activation='softmax', name='conservacion')(x)
    model = models.Model(inputs=inputs, outputs=[out_room, out_conserv])
    model.compile(
        optimizer='adam',
        loss={'ambiente': 'sparse_categorical_crossentropy',
              'conservacion': 'sparse_categorical_crossentropy'},
        metrics={'ambiente': 'accuracy', 'conservacion': 'accuracy'},
    )
    return model

def load_dataset(csv_path, img_dir):
    df = pd.read_csv(csv_path)
    df['path'] = df['filename'].apply(lambda f: os.path.join(img_dir, f))
    df['exists'] = df['path'].apply(os.path.exists)
    df = df[df['exists']].reset_index(drop=True)
    print(f'Imágenes encontradas: {len(df)} / {len(df) + (~df["exists"]).sum()}')
    room_map = {lbl: i for i, lbl in enumerate(ROOM_LABELS)}
    conserv_map = {lbl: i for i, lbl in enumerate(CONSERV_LABELS)}
    df['room_id'] = df['label_ambiente'].map(room_map)
    df['conserv_id'] = df['label_estado_conservacion'].map(conserv_map)
    train_df = df[df['split'] == 'train']
    val_df = df[df['split'] == 'val']
    test_df = df[df['split'] == 'test']
    return train_df, val_df, test_df, room_map, conserv_map

def data_generator(df, batch_size, augment=False):
    n = len(df)
    while True:
        idxs = np.random.permutation(n)
        for start in range(0, n, batch_size):
            batch_idxs = idxs[start:start+batch_size]
            batch_df = df.iloc[batch_idxs]
            images, rooms, conservs = [], [], []
            for _, row in batch_df.iterrows():
                img = load_img(row['path'], target_size=IMG_SIZE)
                arr = img_to_array(img)
                if augment:
                    arr = tf.image.random_flip_left_right(arr)
                    arr = tf.image.random_brightness(arr, 0.1)
                    arr = tf.image.random_contrast(arr, 0.9, 1.1)
                images.append(arr)
                rooms.append(row['room_id'])
                conservs.append(row['conserv_id'])
            yield np.array(images), {'ambiente': np.array(rooms), 'conservacion': np.array(conservs)}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--csv', default='ml_models/tensorflow/data/dl_imagenes/dataset.csv')
    parser.add_argument('--img_dir', default='ml_models/tensorflow/data/dl_imagenes')
    parser.add_argument('--output', default='ml_models/tensorflow/models/cnn_scratch_v1.h5')
    parser.add_argument('--epochs', type=int, default=EPOCHS)
    parser.add_argument('--batch_size', type=int, default=BATCH_SIZE)
    args = parser.parse_args()

    train_df, val_df, test_df, room_map, conserv_map = load_dataset(args.csv, args.img_dir)
    print(f'Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}')
    print(f'Ambientes: {len(room_map)}, Conservación: {len(conserv_map)}')

    steps_per_epoch = len(train_df) // args.batch_size
    validation_steps = len(val_df) // args.batch_size

    model = build_model(len(room_map), len(conserv_map))
    model.summary()

    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=5, min_lr=1e-6),
    ]

    model.fit(
        data_generator(train_df, args.batch_size, augment=True),
        steps_per_epoch=steps_per_epoch,
        validation_data=data_generator(val_df, args.batch_size, augment=False),
        validation_steps=validation_steps,
        epochs=args.epochs,
        callbacks=callbacks,
    )

    test_steps = len(test_df) // args.batch_size
    if test_steps > 0:
        loss, room_acc, cons_acc = model.evaluate(
            data_generator(test_df, args.batch_size),
            steps=test_steps
        )
        print(f'Test — Ambiente: {room_acc:.3f}, Conservación: {cons_acc:.3f}')

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    model.save(str(output_path))
    print(f'Modelo guardado en {output_path}')

if __name__ == '__main__':
    main()
