class Product:
    def __init__(self, nazwa, kalorie=0, bialko=0, weglowodany=0, tluszcze=0, waga=100):
        self.nazwa = nazwa
        self.kalorie = float(kalorie)
        self.bialko = float(bialko)
        self.weglowodany = float(weglowodany)
        self.tluszcze = float(tluszcze)
        self.waga = waga

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
