import joblib
try:
    ml_model=joblib.load("model.pkl")
    print("model loaded succesfully")
except Exception as e:
    print("model load failed ",e)
    ml_model=None