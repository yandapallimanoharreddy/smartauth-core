# smartauth-core

AI-driven adaptive authentication framework for ForgeRock AM 7 — open source



\# SmartAuth — AI-Driven Adaptive Authentication for ForgeRock AM 7



!\[ForgeRock AM 7.3](https://img.shields.io/badge/ForgeRock%20AM-7.3-green)

!\[Python 3.9](https://img.shields.io/badge/Python-3.9-blue)

!\[License MIT](https://img.shields.io/badge/License-MIT-yellow)



\## What is SmartAuth?



SmartAuth is an open-source AI-driven adaptive authentication framework built on ForgeRock Access Management 7. It replaces static, rule-based authentication policies with a machine learning risk scoring engine that analyses real-time login signals and adapts the authentication journey dynamically.



\## How it works



Every login attempt passes through four custom ForgeRock AM scripted nodes:



1\. \*\*Collect Signals\*\* — captures device fingerprint, browser, OS, IP address and login hour

2\. \*\*Time Anomaly\*\* — flags logins outside normal hours

3\. \*\*Failed Attempts\*\* — reads recent failure count from ForgeRock DS

4\. \*\*Risk Engine Caller\*\* — sends all signals to the Python AI risk engine and branches the tree based on the score



The AI risk engine returns a score between 0 and 1 with a recommended action:

\- \*\*Low risk\*\* — user proceeds to login normally

\- \*\*Medium risk\*\* — step-up authentication triggered

\- \*\*High risk\*\* — access blocked and IDM notified



\## Architecture



\## Tech stack



\- ForgeRock AM 7.3 — custom scripted decision nodes

\- ForgeRock IDM 7 — identity governance

\- ForgeRock DS 7 — identity store

\- Python 3.9 / FastAPI / XGBoost / scikit-learn

\- React — live risk dashboard



\## Project status



\- \[x] Phase 1 — ForgeRock AM custom nodes

\- \[x] Phase 2 — ML risk scoring model (XGBoost, 100% accuracy)

\- \[x] Phase 3 — IDM governance integration

\- \[x] Phase 4 — React dashboard

\## Author



Manohar Reddy Yandapalli — IAM Engineer

https://www.linkedin.com/in/manohar-reddy-yandapalli-5998b3212/

