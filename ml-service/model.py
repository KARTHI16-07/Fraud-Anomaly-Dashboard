"""Small Isolation Forest trained on reproducible synthetic normal activity."""

import numpy as np
from sklearn.ensemble import IsolationForest


def train_model() -> IsolationForest:
    """Create typical demo transactions, then fit an unsupervised model."""
    rng = np.random.default_rng(42)
    amount = rng.lognormal(mean=6.2, sigma=0.85, size=700)
    account_age = rng.integers(20, 1800, size=700)
    frequency = rng.poisson(lam=5, size=700)
    examples = np.column_stack((amount, account_age, frequency))

    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(examples)
    return model


MODEL = train_model()


def predict(amount: float, account_age: int, transaction_frequency: int) -> tuple[int, float]:
    """Return scikit-learn's 1/-1 prediction and decision-function score."""
    sample = np.array([[amount, account_age, transaction_frequency]])
    return int(MODEL.predict(sample)[0]), float(MODEL.decision_function(sample)[0])
