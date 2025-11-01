from rest_framework import serializers
from .models import Meal, Menu, User # İhtiyacımız olan modelleri import et

class MealSerializer(serializers.ModelSerializer):
    """
    Meal (Yemek) modelini JSON'a çevirir.
    """
    class Meta:
        model = Meal
        # Hangi alanların JSON'da görüneceğini seçiyoruz
        fields = ['id', 'name', 'category', 'calories', 'allergens']


class MenuSerializer(serializers.ModelSerializer):
    """
    Menu (Menü) modelini ve *içindeki yemekleri* JSON'a çevirir.
    """

    # "meals" alanı, bizim ModelSerializer'ımıza bağlıdır.
    # DRF, "meals" alanını otomatik olarak tanır ve MealSerializer'ı kullanır.
    # Biz sadece "iç içe" (nested) gösterim istiyoruz.
    meals = MealSerializer(many=True, read_only=True) # many=True -> birden fazla yemek var

    class Meta:
        model = Menu
        # "date" alanı Menü'den, "meals" alanı ilişkiden gelecek
        fields = ['id', 'date', 'meals']