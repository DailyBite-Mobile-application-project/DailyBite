class Product:
    def __init__(self, nazwa, kalorie, bialko, weglowodany, tluszcze, waga=100):
        self.nazwa = nazwa
        self.kalorie = kalorie
        self.bialko = bialko
        self.weglowodany = weglowodany
        self.tluszcze = tluszcze
        self.waga = waga

    def save(self, collection):
        collection.update_one(
            {"nazwa": self.nazwa},
            {"$set": self.__dict__},
            upsert=True
        )
