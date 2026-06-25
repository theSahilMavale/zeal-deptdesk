from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "name",
                  "role", "phone", "is_active", "password")
        read_only_fields = ("id", "name")

    def get_name(self, obj):
        full = f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        return full or obj.username

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class MeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name",
                  "name", "role", "phone")
        read_only_fields = fields

    def get_name(self, obj):
        full = f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        return full or obj.username


class DeptDeskTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    JWT serializer that accepts either `username` or `email` for sign-in
    and embeds the resolved user record in the response.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        return token

    def validate(self, attrs):
        # Allow email-based login by translating it to the username field.
        email = self.initial_data.get("email") if hasattr(self, "initial_data") else None
        username = attrs.get(self.username_field)
        if (not username) and email:
            try:
                user = User.objects.get(email__iexact=email)
                attrs[self.username_field] = user.username
            except User.DoesNotExist:
                pass
        elif username and "@" in username:
            # Frontend may send the email in the username field.
            try:
                user = User.objects.get(email__iexact=username)
                attrs[self.username_field] = user.username
            except User.DoesNotExist:
                pass

        data = super().validate(attrs)
        data["user"] = MeSerializer(self.user).data
        return data
