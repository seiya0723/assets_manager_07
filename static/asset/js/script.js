var CHART0   = null;
var CHART1   = null;
var CHART2   = null;

window.addEventListener("load" , function(){

    let d       = new Date();
    let year    = d.getFullYear();
    let month   = ('0' + (d.getMonth() +1)).slice(-2);
    let day     = ('0' + d.getDate()).slice(-2);
    let dt      = year + "-" + month + "-" + day + " 05:00";

    let conflg_dt = {
        defaultDate: dt,
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        "locale": "ja"
    }

    flatpickr("#pay_dt", conflg_dt);


    //Ajaxなどによって的に表示非表示する要素にイベントリスナを設定する時このようにする。
    $(document).on("click",".pie_chart", function() { pie_chart(); });
    $(document).on("click",".bar_chart", function() { bar_chart(); });


    //削除のイベントリスナの設定(削除ボタンもAjax等で表示非表示が切り替わるので、documentに設定する。)
    $(document).on("click",".delete", function() { balance_delete( $(this).val() ); });



    /*
    $(".category_income").on("click",function(){ console.log("収入"); });
    $(".category_spending").on("click",function(){ console.log("支出"); });
    */

    //収入支出カテゴリ指定時に不要な入力欄を無効化する
    $("#balance_category").on("change", function(){
        let cate    = $(this).find(":selected").attr("class");
        
        if (cate === "category_spending"){
            console.log("支出");
            $("#main_form > [name='income']").val("0");
            $("#main_form > [name='income']").prop("disabled",true);
            $("#main_form > [name='spending']").prop("disabled",false);
        }
        else if (cate === "category_income"){
            console.log("収入");
            $("#main_form > [name='spending']").val("0");
            $("#main_form > [name='spending']").prop("disabled",true);
            $("#main_form > [name='income']").prop("disabled",false);
        }

        //console.log( $(this).find(":selected").attr("class") );
    });



    $("#main_form_submit").on("click",function(){ submit(); });


    //モーダルの領域外が押されたときの処理
    $('#modal').on('click', function(event) {
        //#modalがクリックされた時、クリック位置が#modal_contentではない時、モーダルを非表示にする。
        if(!($(event.target).closest($('#modal_content')).length)){
            $("#double_graph").hide();
            $("#single_graph").hide();
            $('#modal').hide();
        }
    });

});

function pie_chart(){
    draw_pie_graph();
    $("#double_graph").show();
    $("#modal").show();
}

function bar_chart(){
    draw_bar_graph();
    $("#single_graph").show();
    $("#modal").show();

}


//折れ線+棒グラフの描画
function draw_bar_graph(){

    let ctx0    = $("#graph0");

    //月ごとのデータを計算、収入は折れ線、支出は棒グラフ

    let data    = get_bar_data();
    let income_data     = data["income_data"];
    let spending_data   = data["spending_data"];

    console.log(data["income_data"]);
    console.log(data["spending_data"]);

    if (CHART0) {
        CHART0.destroy();
    }

    //折れ線と棒グラフをセットで配置するにはdatasetsに辞書型のリストを指定
    CHART0  = new Chart(ctx0, {
        type: 'bar',
        data: {
          labels: Object.keys(income_data),
          datasets: [
            {
              label: '収入',
              type: 'line',
              data: Object.values(income_data),
              borderColor: "rgba(0,255,0,1)",
              backgroundColor: "rgba(0,0,0,0)",
              pointBackgroundColor: "rgba(0,255,0,1)",
              tension: 0,
              pointRadius:8,
              pointHoverRadius:8.5,
              pointStyle:'rectRot',
            },
            {
              label: '支出',
              type: 'bar',
              data: Object.values(spending_data),
              borderColor: "rgba(255,0,0,0)",
              backgroundColor: "rgba(255,0,0,0.75)",
            },
          ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });



}

//FIXME:一月に収入か支出のどちらかしか無い場合、片方のデータが欠落して、以降のデータがズレてしまう問題がある。
function get_bar_data(){

    let income_data   = {};
    let spending_data = {};

    for (let month=1;month<13;month++){

        let income_sum      = 0;
        let spending_sum    = 0;

        let category    = $("#tab_area_" + String(month) + " > table > tbody > tr > .balance_category");
        let income      = $("#tab_area_" + String(month) + " > table > tbody > tr > .balance_income  ");
        let spending    = $("#tab_area_" + String(month) + " > table > tbody > tr > .balance_spending");

        let length      = category.length;

        //その月に何も無かったときの処理←あろうがなかろうが、0で初期化。
        /*
        if (length === 0){
            income_data[String(month)+"月"]     = 0;
            spending_data[String(month)+"月"]   = 0;
            continue;
        }
        */
        income_data[String(month)+"月"]     = 0;
        spending_data[String(month)+"月"]   = 0;

        //あればString(month)+"月"に数値が追加される。初期化の必要はないので、elseはコメントアウト
        for (let i=0;i<length;i++){
            income_data[String(month)+"月"] += Number(income.eq(i).text().replace(/,/g,""));
            /*
            if ( income.eq(i).text() === "0" ){ continue; }
            if (String(month)+"月" in income_data){
                income_data[String(month)+"月"] += Number(income.eq(i).text().replace(/,/g,""));
            }
            else{
                income_data[String(month)+"月"] = Number(income.eq(i).text().replace(/,/g,"")) ;
            }
            */
        }
        for (let i=0;i<length;i++){
            spending_data[String(month)+"月"] += Number(spending.eq(i).text().replace(/,/g,""));
            /*
            if ( spending.eq(i).text() === "0" ){ continue; }
            if (String(month)+"月" in spending_data){
                spending_data[String(month)+"月"] += Number(spending.eq(i).text().replace(/,/g,""));
            }
            else{
                spending_data[String(month)+"月"] = Number(spending.eq(i).text().replace(/,/g,"")) ;
            }
            */
        }

        console.log(category  )
        console.log(income    )
        console.log(spending  )
        console.log(length    )
    }


    return {"income_data":income_data,"spending_data":spending_data};

}

function draw_pie_graph(){

    //1と2でpie_chartを描画


    let ctx1    = $("#graph1");
    let ctx2    = $("#graph2");

    //現在表示中のタブのデータを抜き取る(チェックされたラジオボタンのvalueを引数に指定)
    let data    = get_pie_data( $("[name=tab_system]:checked").val() );
    let income_data     = data["income_data"];
    let spending_data   = data["spending_data"];

    console.log(income_data)
    console.log(spending_data)

    //FIXME:収入のカテゴリ、支出のカテゴリで色がバラバラになってしまう
    //TODO:乱数を使わず、カテゴリに対して直接色を指定する(モデルで定義するのは？)←乱数を使わず、カテゴリ数に応じて徐々に数値を小さくするのは？

    let income_color           = [];
    let income_color_length    = Object.keys(income_data).length;
    var rgb = 255;
    var rgb_minus   = 255/income_color_length;

    for (let i=0;i<income_color_length;i++){
        income_color.push("rgb(100, " + String(rgb)+ ", 100)");
        rgb -= rgb_minus;
    }

    let spending_color           = []
    let spending_color_length    = Object.keys(spending_data).length
    var rgb         = 255;
    var rgb_minus   = 255/spending_color_length;

    for (let i=0;i<spending_color_length;i++){
        spending_color.push("rgb(" + String(rgb)+ ",0,0)");
        rgb -= rgb_minus;
    }


    /* data
     *
     * labels グラフ上部に表示するラベル
     *
     * datasets
     *
     * data 表示するデータ
     * backgroundColor 色
     *
     */
    let income      = {
        labels: Object.keys(income_data),
        datasets: [ {
            data: Object.values(income_data),
            backgroundColor: income_color,
            borderWidth: 1
        } ]
    };
    let spending    = {
        labels: Object.keys(spending_data),
        datasets: [ {
            data: Object.values(spending_data),
            backgroundColor: spending_color,
            borderWidth: 1
        } ]
    };


    let income_options = {
        responsive: true,
        maintainAspectRatio: false,
    };
    let spending_options = {
        responsive: true,
        maintainAspectRatio: false,
    };


    if (CHART1) {
        CHART1.destroy();
    }
    CHART1   = new Chart(ctx1, {
        type: "pie",
        data: income,
        options: income_options,
    });

    if (CHART2) {
        CHART2.destroy();
    }
    CHART2   = new Chart(ctx2, {
        type: "pie",
        data: spending,
        options: spending_options,
    });

}

function get_pie_data(val){

    //labelタグのfor属性からテーブル内にある全データを抽出
    //カテゴリごとに計算して、返却する。

    console.log($("#tab_area_" + val + " > table > tbody > tr > .balance_category"));

    let category    = $("#tab_area_" + val + " > table > tbody > tr > .balance_category");
    let income      = $("#tab_area_" + val + " > table > tbody > tr > .balance_income  ");
    let spending    = $("#tab_area_" + val + " > table > tbody > tr > .balance_spending");

    let length      = category.length;

    let income_data     = {};
    let spending_data   = {};


    //収入計算
    for (let i=0;i<length;i++){
        if ( income.eq(i).text() === "0" ){ continue; }
        let category_name   = category.eq(i).text();
        //カテゴリごとの計算結果が格納されていれば追加加算、なければ新たに定義
        if (category_name in income_data){
            income_data[category_name] += Number(income.eq(i).text().replace(/,/g,""));
        }
        else{
            income_data[category_name] = Number(income.eq(i).text().replace(/,/g,"")) ;
        }
    }

    //支出計算
    for (let i=0;i<length;i++){
        if ( spending.eq(i).text() === "0" ){ continue; }
        let category_name   = category.eq(i).text();
        //カテゴリごとの計算結果が格納されていれば追加加算、なければ新たに定義
        if (category_name in spending_data){
            spending_data[category_name] += Number(spending.eq(i).text().replace(/,/g,""));
        }
        else{
            spending_data[category_name] = Number(spending.eq(i).text().replace(/,/g,""));
        }
    }


    //大きい順に並び替える。
    //TIPS:オブジェクトに対するソーティング
    //https://stackoverflow.com/questions/1069666/sorting-object-property-by-values

    console.log(income_data);
    console.log(spending_data);

    //.entries()メソッドを使って配列に変換し、.sort()メソッドで値を元にソーティング。

    let income_data_sorted = Object.fromEntries(
        Object.entries(income_data).sort(([,a],[,b]) => b-a) //小さい順に並び替えるにはa-bとする。
    );
    let spending_data_sorted = Object.fromEntries(
        Object.entries(spending_data).sort(([,a],[,b]) => b-a)
    );

    return {"income_data":income_data_sorted,"spending_data":spending_data_sorted};

}


//データの投稿(Ajax処理)
function submit(){

    let form_elem   = "#main_form";

    let data    = new FormData( $(form_elem).get(0) );
    let url     = $(form_elem).prop("action");
    let method  = $(form_elem).prop("method");

    //フォームの中身の確認
    for (let v of data.entries() ){ console.log(v); }

    $.ajax({
        url: url,
        type: method,
        data: data,
        processData: false,
        contentType: false,
        dataType: 'json'
    }).done( function(data, status, xhr ) {

        if (data.error){
            console.log("error!!");
        }
        else{

            $("#tab_area_0").html(data.year);
            $("#tab_area_" + String(data.selected_month) ).html(data.month);

        }

        //console.log(data);

    }).fail( function(xhr, status, error) {
        console.log(status + ":" + error );
    });


}

function balance_delete(id){


    let form_elem   = "#" + id + "_delete" ;

    let data    = new FormData( $(form_elem).get(0) );
    let url     = $(form_elem).prop("action");
    let method  = $(form_elem).prop("method");

    //フォームの中身の確認
    for (let v of data.entries() ){ console.log(v); }

    $.ajax({
        url: url,
        type: method,
        data: data,
        processData: false,
        contentType: false,
        dataType: 'json'
    }).done( function(data, status, xhr ) {

        if (data.error){
            console.log("error!!");
        }
        else{

            $("#tab_area_0").html(data.year);
            $("#tab_area_" + String(data.selected_month) ).html(data.month);

        }

        //console.log(data);

    }).fail( function(xhr, status, error) {
        console.log(status + ":" + error );
    });

}
