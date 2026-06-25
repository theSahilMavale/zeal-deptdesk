"""Smoke tests for the Students API."""
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Student


def _auth(client, user):
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")


class StudentApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("tester", password="pw-secret-123")
        _auth(self.client, self.user)

    def test_create_and_list_student(self):
        payload = {
            "id": "ZP-CO-001",
            "name": "Rohan Patel",
            "email": "rohan@zealpoly.edu",
            "phone": "+91-90000-00001",
            "class": "CO5I",
            "dept": "Computer",
            "year": "TY",
            "cgpa": "8.50",
            "attendance": 92,
        }
        res = self.client.post("/api/students/", payload, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(Student.objects.count(), 1)

        res = self.client.get("/api/students/")
        self.assertEqual(res.status_code, 200)
        results = res.json().get("results", res.json())
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["class"], "CO5I")

    def test_attendance_validation(self):
        payload = {
            "id": "ZP-CO-002",
            "name": "Invalid",
            "email": "x@y.com",
            "class": "CO5I",
            "dept": "Computer",
            "year": "TY",
            "attendance": 150,
        }
        res = self.client.post("/api/students/", payload, format="json")
        self.assertEqual(res.status_code, 400)
