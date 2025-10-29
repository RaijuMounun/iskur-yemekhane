# backend/api/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Meal, Menu, MenuMeal, MealRating, MenuLike, SurveyAnswer

# --- 1. User Modelimizi Özelleştirme ---
# User modelimize 'role' alanı eklemiştik. Bunu admin panelinde göstermeliyiz.
class CustomUserAdmin(UserAdmin):
    # Admin listesinde görünecek alanlar
    list_display = ('email', 'username', 'role', 'is_staff', 'is_active')

    # Kullanıcı düzenleme formunda 'role' alanını göster
    # (Orijinal fieldset'lere 'role'ü ekliyoruz)
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )

# --- 2. Menü-Yemek İlişkisi için "Inline" Kullanma ---
# Bu, bir Menü oluştururken *aynı sayfada* o menüye Yemek eklememizi sağlar.
# Bu, adminin işini ÇOK kolaylaştıran "Temiz Arayüz" pratiğidir.
class MenuMealInline(admin.TabularInline):
    model = MenuMeal
    extra = 3  # Varsayılan olarak 3 adet boş yemek ekleme alanı göster

# --- 3. Menu Modelini Özelleştirme ---
class MenuAdmin(admin.ModelAdmin):
    list_display = ('date',)
    inlines = [MenuMealInline] # Az önce tanımladığımız "inline"ı buraya bağlıyoruz

# --- 4. Modellerimizi Panele Kaydetme ---
admin.site.register(User, CustomUserAdmin) # Kendi CustomUserAdmin'imiz ile
admin.site.register(Meal)                  # Meal için standart admin yeterli
admin.site.register(Menu, MenuAdmin)       # Menu için kendi MenuAdmin'imiz ile

# Bu modelleri de panelde görelim (ama özel bir ayara gerek yok)
admin.site.register(MealRating)
admin.site.register(MenuLike)
admin.site.register(SurveyAnswer)

# NOT: MenuMeal'i ayrıca kaydetmemize gerek yok, çünkü o artık Menu'nün bir parçası.