from dataclasses import dataclass


@dataclass
class Product:
    nazwa: str
    kalorie: float = 0.0
    bialko: float = 0.0
    weglowodany: float = 0.0
    tluszcze: float = 0.0
    waga: float = 100.0

    def __post_init__(self) -> None:
        if not self.nazwa or not str(self.nazwa).strip():
            raise ValueError("nazwa nie może być pusta")

        # Normalizacja typów
        self.nazwa = str(self.nazwa).strip()
        self.kalorie = float(self.kalorie or 0)
        self.bialko = float(self.bialko or 0)
        self.weglowodany = float(self.weglowodany or 0)
        self.tluszcze = float(self.tluszcze or 0)
        self.waga = float(self.waga or 100)

    def to_dict(self):
        return {
            "nazwa": self.nazwa,
            "kalorie": self.kalorie,
            "bialko": self.bialko,
            "weglowodany": self.weglowodany,
            "tluszcze": self.tluszcze,
            "waga": self.waga
        }

    def save(self, collection):
        collection.update_one(
            {"nazwa": self.nazwa},
            {"$set": self.to_dict()},
            upsert=True
        )
