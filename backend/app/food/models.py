from dataclasses import dataclass

@dataclass
class Product:
    nazwa: str
    kategoria: str = "Inne"
    kalorie: float = 0.0
    bialko: float = 0.0
    weglowodany: float = 0.0
    tluszcz: float = 0.0
    waga: float = 100.0

    def __post_init__(self) -> None:
        if not self.nazwa or not str(self.nazwa).strip():
            raise ValueError("nazwa nie może być pusta")

        self.nazwa = str(self.nazwa).strip()
        self.kategoria = str(self.kategoria or "Inne").strip()
        self.kalorie = float(self.kalorie or 0)
        self.bialko = float(self.bialko or 0)
        self.weglowodany = float(self.weglowodany or 0)
        self.tluszcz = float(self.tluszcz or 0)
        self.waga = float(self.waga or 100)

    def to_dict(self) -> dict:
        return {
            "nazwa": self.nazwa,
            "kategoria": self.kategoria,
            "kalorie": self.kalorie,
            "bialko": self.bialko,
            "weglowodany": self.weglowodany,
            "tluszcz": self.tluszcz,
            "waga": self.waga,
        }

    def save(self, collection) -> None:
        collection.update_one(
            {"nazwa": self.nazwa},
            {"$set": self.to_dict()},
            upsert=True,
        )
