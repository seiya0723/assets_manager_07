from django import forms
from .models import Balance

class BalanceForm(forms.ModelForm):
    class Meta:
        model     = Balance
        fields   = [ "category","comment","income","spending","pay_dt"]


class YearForm(forms.Form):
    year     = forms.IntegerField()
