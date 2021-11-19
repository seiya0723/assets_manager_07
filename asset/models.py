from django.db import models
from django.utils import timezone

from django.contrib.auth.models import User


class Category(models.Model):
    class Meta:
        db_table = "category"

    name = models.CharField(verbose_name="カテゴリ名",max_length=100)
    dt = models.DateTimeField(verbose_name="追加日", default=timezone.now)
    income = models.BooleanField(verbose_name="収支(True=収入,False=支出)", default=False)

    #user    = models.ForeignKey(User, verbose_name="投稿したユーザー", on_delete=models.CASCADE)


    def __str__(self):
        return self.name

class Balance(models.Model):

    class Meta:
        db_table = "balance"

    category = models.ForeignKey(Category,verbose_name="カテゴリ",on_delete=models.CASCADE,blank=True, null=True)


    title = models.CharField(verbose_name="タイトル", max_length=100, default="")
    comment = models.CharField(verbose_name="コメント", blank=True, max_length=2000)
    income = models.IntegerField(verbose_name="収入", default=0 , null=True,blank=True)
    spending = models.IntegerField(verbose_name="支出", default=0, null=True,blank=True)
    dt = models.DateTimeField(verbose_name="投稿日", default=timezone.now)
    pay_dt  =  models.DateTimeField(verbose_name="決済日")

    #user    = models.ForeignKey(User, verbose_name="投稿したユーザー", on_delete=models.CASCADE)

    def __str__(self):
        return self.comment
