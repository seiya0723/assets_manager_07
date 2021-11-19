from django.shortcuts import render, redirect
from django.views import View

from django.contrib.auth.mixins import LoginRequiredMixin

from .models import Balance, Category
from .forms import BalanceForm, YearForm

from django.db.models import Q
from django.http.response import JsonResponse
from django.template.loader import render_to_string

import datetime



#小計値の計算(他のビューでも扱うため関数化)
def add_total(balances):

    total   = 0
    for balance in balances:
        total           = total + balance.income - balance.spending
        balance.total   = total 

    return balances

class BalanceView(LoginRequiredMixin, View):

    def get(self, request, *args, **kwargs):

        categories = Category.objects.all().order_by("-income","-id")

        # 最古から最新の年リストを生成(決済日)
        dt = datetime.datetime.now()
        now_year = dt.year  # ←最新の決算日の年を当てるべきでは？
        years = []

        balance = Balance.objects.order_by("pay_dt").first()

        # 最古のデータがあれば最古のデータの年から今年までのリストを作る。(これがテンプレートのselectタグになる。)
        # なければ今年だけ表示
        if balance:
            old_year = balance.pay_dt.year
            print(old_year)
            for i in range(now_year, old_year - 1, -1):
                years.append(i)
        else:
            years.append(now_year)

        # yearの指定があれば、年のデータを抜き取り検索する。指定がなければ現在の年を指定
        form = YearForm(request.GET)
        selected_year = now_year

        if form.is_valid():
            data = form.cleaned_data
            selected_year = data["year"]

        # 1年分のデータ
        balances = Balance.objects.filter(pay_dt__year=selected_year).order_by("pay_dt")

        #小計値の属性を付与する
        balances = add_total(balances)

        # 月ごとのデータ(小計の属性を付与した上でアペンド)
        months = []
        for i in range(1, 13):
            months.append(add_total(Balance.objects.filter(pay_dt__year=selected_year, pay_dt__month=i).order_by("pay_dt")))

        context = {"balances": balances,
                   "categories": categories,
                   "years": years,
                   "months": months,
                   "selected_year": selected_year,
                   }

        return render(request, "asset/index.html", context)

    def post(self, request, *args, **kwargs):

        json = {"error": True}
        form = BalanceForm(request.POST)

        if not form.is_valid():
            print("バリデーションNG")
            return JsonResponse(json)

        print("バリデーションOK")
        result = form.save()

        # ここまでで受け取ったデータを保存している。

        # 投稿があった月と年を抜き取り
        selected_month = result.pay_dt.month
        selected_year = result.pay_dt.year

        # Ajax送信と同時に選択中の年を同時に送信、受け取り後、以下のバリデーションと抽出を行う。
        # 複雑になりすぎるので後日実装

        #======================ここから============

        year = Balance.objects.filter(pay_dt__year=selected_year).order_by("pay_dt")
        month = Balance.objects.filter(pay_dt__year=selected_year, pay_dt__month=selected_month).order_by("pay_dt")

        year = add_total(year)
        month = add_total(month)

        # yearとmonthのレンダリング結果を文字列でそれぞれ返す。
        context = {"balances": year}
        year = render_to_string('asset/table.html', context, request)
        context = {"balances": month}
        month = render_to_string('asset/table.html', context, request)

        # jsonに追加。文字列のレンダリング結果をJavaScriptが指定した箇所に張り付けする。
        json["error"] = False
        json["year"] = year
        json["month"] = month
        json["selected_month"] = selected_month

        #======================ここまで============


        # Ajaxを送信した後はjsonを返却する(JsonResponse)
        return JsonResponse(json)

index = BalanceView.as_view()

class BalanceDeleteView(LoginRequiredMixin, View):

    def post(self, request, pk, *args, **kwargs):

        json    = {"error":True}
        balance = Balance.objects.filter(id=pk).first()
        
        #存在しない場合はエラーを返す。
        if not balance:
            return JsonResponse(json)


        selected_year   = balance.pay_dt.year
        selected_month  = balance.pay_dt.month

        #対象を削除する。削除してから検索してレンダリングをする。
        balance.delete()

        #======================ここから============
        year = Balance.objects.filter(pay_dt__year=selected_year).order_by("pay_dt")
        month = Balance.objects.filter(pay_dt__year=selected_year, pay_dt__month=selected_month).order_by("pay_dt")

        year = add_total(year)
        month = add_total(month)

        # yearとmonthのレンダリング結果を文字列でそれぞれ返す。
        context = {"balances": year}
        year = render_to_string('asset/table.html', context, request)
        context = {"balances": month}
        month = render_to_string('asset/table.html', context, request)

        # jsonに追加。文字列のレンダリング結果をJavaScriptが指定した箇所に張り付けする。
        json["error"] = False
        json["year"] = year
        json["month"] = month
        json["selected_month"] = selected_month
        #======================ここまでBalanceViewのPOST文と共通している============


        return JsonResponse(json)

delete = BalanceDeleteView.as_view()


#FIXED: index = BalanceView.as_view() から末端の delete = BalanceDeleteView.as_view()までインデントがひとつ右にズレていたので修正。






