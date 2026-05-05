import random
from locust import HttpUser, task, between


class EmergenzaUser(HttpUser):
    wait_time = between(1, 3)
    token = None

    def on_start(self):
        res = self.client.post("/api/auth/login", data={
            "username": "operatore1",
            "password": "password123",
        })
        if res.status_code == 200:
            self.token = res.json()["access_token"]

    def headers(self):
        return {"Authorization": f"Bearer {self.token}"}

    @task(5)
    def get_segnalazioni(self):
        self.client.get("/api/emergenze/", headers=self.headers())

    @task(2)
    def get_stats(self):
        self.client.get("/api/emergenze/stats", headers=self.headers())

    @task(1)
    def get_timeline(self):
        self.client.get("/api/timeline/", headers=self.headers())

    @task(3)
    def create_segnalazione(self):
        self.client.post("/api/emergenze/", json={
            "tipo": random.choice(["incidente", "terremoto", "incendio", "alluvione", "altro"]),
            "descrizione": f"Segnalazione di test #{random.randint(1, 9999)}",
            "latitudine": round(random.uniform(36.0, 47.0), 6),
            "longitudine": round(random.uniform(6.0, 18.0), 6),
        }, headers=self.headers())
