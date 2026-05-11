import pandas as pd
import numpy as np
import random

np.random.seed(42)
random.seed(42)

n = 10000
data = []

for i in range(n):
    hour = random.randint(0, 23)
    failed = random.randint(0, 10)
    is_new_device = random.randint(0, 1)
    is_unusual_country = random.randint(0, 1)
    login_day = random.randint(0, 6)

    risk = 0

    if hour < 6:
        risk += 3
    elif hour < 8 or hour > 22:
        risk += 1

    if failed > 5:
        risk += 4
    elif failed > 2:
        risk += 2

    if is_new_device:
        risk += 2

    if is_unusual_country:
        risk += 3

    if login_day >= 5:
        risk += 1

    if risk >= 7:
        label = 2
    elif risk >= 3:
        label = 1
    else:
        label = 0

    data.append([hour, failed, is_new_device, 
                 is_unusual_country, login_day, label])

df = pd.DataFrame(data, columns=[
    "login_hour", "failed_attempts", "is_new_device",
    "is_unusual_country", "login_day", "risk_label"
])

df.to_csv("training_data.csv", index=False)
print("Done! Records:", len(df))
print(df["risk_label"].value_counts())