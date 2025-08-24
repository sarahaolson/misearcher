import pandas as pd
import numpy as np
import math


def calculate_error(judged_percent, true_percent):
    abs_error = np.abs(judged_percent - true_percent)
    log_2_error = np.log2(abs_error + 1/8)

    if log_2_error == -3:
        log_2_error = 0

    return log_2_error

def generate_dataset(shape):
    df_acc_shape = pd.DataFrame()
    df_acc_shape['log_error'] = df_acc[f'{shape}_acc'].dropna()

    df_acc_shape.to_csv(f'results_py/log_error_datasets/{shape}_acc.csv', index=False)     


df = pd.read_csv("results_py/survey_results.csv")

df.fillna(0, inplace=True)
df_acc = pd.DataFrame()

# calculate log error
for index, row in df.iterrows():
    for i in range(2, 17):
        question_type = row[f'question_id_{i}']
        question_title = question_type[:-2] + '_acc'

        error = calculate_error(row[f'correct_value_{i}'], row[f'user_value_{i}'])

        df_acc = df_acc._append({f'{question_title}': error}, ignore_index = True)

# reset indexes to make it easeir to generate csvs
df_acc = df_acc.apply(lambda x: x.dropna().reset_index(drop=True), axis=0)

# generate datasets of log errors
for shape in ['circle', 'rect', 'parab']:
    generate_dataset(shape)
