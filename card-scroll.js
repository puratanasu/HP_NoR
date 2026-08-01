const slider = document.querySelector(".card-slider");

if (!slider) {
  console.warn("'.card-slider' が見つかりません。");
} else {

  const cards = Array.from(slider.querySelectorAll(".card"));

  /*
   * cards の順番そのものを「現在のカード順」として扱います。
   *
   * 例：
   *
   * [Profile, Information, Portfolio]
   *
   * ↓ scroll
   *
   * [Information, Portfolio, Profile]
   *
   * ↓ scroll
   *
   * [Portfolio, Profile, Information]
   */

  let order = [...cards];

  let isAnimating = false;

  /*
   * ホイールの連続入力を1回の操作として扱うための
   * クールダウン時間。
   */
  const WHEEL_COOLDOWN = 1000;

  let lastWheelTime = 0;

  /*
   * スワイプ用
   */
  let touchStartX = 0;
  let touchStartY = 0;

  /*
   * =========================================================
   * カードの高さに合わせてsliderの高さを調整
   * =========================================================
   */

  function updateSliderHeight() {

    if (cards.length === 0) {
      return;
    }

    /*
     * 一番高いカードを基準にする。
     */
    let maxHeight = 0;

    cards.forEach(card => {
      const height = card.offsetHeight;

      if (height > maxHeight) {
        maxHeight = height;
      }
    });

    if (maxHeight > 0) {
      const isMobile = window.innerWidth <= 600;

      slider.style.minHeight =
        `${maxHeight + (isMobile ? 100 : 120)}px`;
    }
  }


  /*
   * =========================================================
   * カードの見た目を更新
   * =========================================================
   */

  function renderCards() {

    order.forEach((card, index) => {

      /*
       * 以前の状態を全部消す。
       */
      card.classList.remove(
        "card-front",
        "card-second",
        "card-back",
        "card-hidden"
      );

      /*
       * z-indexをJS側でも設定。
       */
      card.style.zIndex = String(100 - index);

      /*
       * 現在位置に応じてクラスを付ける。
       */
      if (index === 0) {

        card.classList.add("card-front");

      } else if (index === 1) {

        card.classList.add("card-second");

      } else if (index === 2) {

        card.classList.add("card-back");

      } else {

        card.classList.add("card-hidden");
      }
    });
  }


  /*
   * =========================================================
   * 初期化
   * =========================================================
   */

  function initialize() {

    cards.forEach(card => {
      card.classList.remove(
        "card-front",
        "card-second",
        "card-back",
        "card-hidden",
        "card-leaving-next",
        "card-leaving-prev"
      );
    });

    renderCards();

    slider.classList.add("cards-ready");

    updateSliderHeight();
  }


  /*
   * =========================================================
   * 次のカードへ
   *
   * Profile
   *    ↓
   * Information
   *
   * Profileを最後尾へ移動
   * =========================================================
   */

  function nextCard() {

    if (isAnimating || order.length <= 1) {
      return;
    }

    isAnimating = true;

    slider.classList.add("is-moving");

    const currentCard = order[0];

    /*
     * 現在の一番手前のカードを
     * 「めくれて奥へ行く」状態にする。
     */
    currentCard.classList.remove(
      "card-front",
      "card-second",
      "card-back",
      "card-hidden"
    );

    currentCard.classList.add("card-leaving-next");


    /*
     * アニメーション中に次のカードを
     * 前面へ移動させる。
     *
     * ここではDOM順ではなくclassで見た目を変更する。
     */

    if (order.length > 1) {
      order[1].classList.remove(
        "card-front",
        "card-second",
        "card-back",
        "card-hidden"
      );

      order[1].classList.add("card-front");
    }


    /*
     * CSSアニメーション終了後に、
     * 実際の順番を変更する。
     */
    setTimeout(() => {

      /*
       * 一番前のカードを最後尾へ。
       */
      const first = order.shift();

      order.push(first);

      /*
       * 念のためアニメーション状態を解除。
       */
      currentCard.classList.remove(
        "card-leaving-next",
        "card-leaving-prev"
      );

      /*
       * 新しい順番で再描画。
       */
      renderCards();

      slider.classList.remove("is-moving");

      isAnimating = false;

    }, 650);
  }


  /*
   * =========================================================
   * 前のカードへ
   *
   * 例：
   *
   * [Profile, Information, Portfolio]
   *
   * ↑ scroll
   *
   * [Portfolio, Profile, Information]
   *
   * =========================================================
   */

  function previousCard() {

  if (isAnimating || order.length <= 1) {
    return;
  }

  isAnimating = true;

  slider.classList.add("is-moving");

  const currentCard = order[0];

  /*
   * 戻ってくるカード
   */
  const previous = order[order.length - 1];


  /*
   * ---------------------------------------------------------
   * まず全カードを通常状態から外す
   * ---------------------------------------------------------
   */

  order.forEach(card => {

    card.classList.remove(
      "card-front",
      "card-second",
      "card-back",
      "card-hidden",
      "card-leaving-next",
      "card-leaving-prev"
    );

  });


  /*
   * ---------------------------------------------------------
   * 現在のカード
   *
   * 左下角を軸に右回転して退場
   * ---------------------------------------------------------
   */

  currentCard.classList.add("card-leaving-prev");


  /*
   * ---------------------------------------------------------
   * 戻ってくるカードだけを前面に出す
   * ---------------------------------------------------------
   */

  previous.classList.add("card-front");


  /*
   * ---------------------------------------------------------
   * それ以外のカードは完全に隠す
   *
   * これによって
   *
   * 「2つ前のカードが一瞬透けて見える」
   *
   * のを防ぐ。
   * ---------------------------------------------------------
   */

  order.forEach(card => {

    if (
      card !== currentCard &&
      card !== previous
    ) {

      card.classList.add("card-hidden");

      card.style.opacity = "0";
      card.style.visibility = "hidden";
    }

  });


  /*
   * ---------------------------------------------------------
   * 戻ってくるカードを確実に最前面へ
   * ---------------------------------------------------------
   */

  previous.style.zIndex = "300";
  currentCard.style.zIndex = "200";


  /*
   * ---------------------------------------------------------
   * アニメーション終了
   * ---------------------------------------------------------
   */

  setTimeout(() => {

    /*
     * 最後尾カードを先頭へ
     */
    const last = order.pop();

    order.unshift(last);


    /*
     * 一時的な状態を解除
     */

    order.forEach(card => {

      card.style.visibility = "";
      card.style.opacity = "";
      card.style.zIndex = "";

      card.classList.remove(
        "card-leaving-next",
        "card-leaving-prev"
      );

    });


    /*
     * 新しい順番で再描画
     */

    renderCards();


    slider.classList.remove("is-moving");

    isAnimating = false;

  }, 650);
}


 /*
 * =========================================================
 * マウスホイール / トラックパッド
 * =========================================================
 *
 * wheelの「強さ」や「勢い」は一切見ない。
 *
 * 1回のwheelイベントの流れ
 *      ↓
 * 1枚だけ予約
 *
 * wheelイベントが一旦途切れる
 *      ↓
 * 次のwheelイベントの流れを新しいスワイプとして扱う
 *
 * アニメーション中でも予約可能。
 */


/*
 * wheelイベントが途切れたと判断する時間。
 *
 * これはスワイプの強さではなく、
 * 「次のスワイプとの区切り」にだけ使用する。
 */
const WHEEL_END_DELAY = 70;


/*
 * 現在のwheelジェスチャーですでに
 * 1枚予約したか。
 */
let wheelGestureUsed = false;


/*
 * wheel終了判定用タイマー。
 */
let wheelEndTimer = null;


/*
 * 予約されたカード移動。
 *
 *  1  = next
 * -1  = previous
 */
let pendingMoves = [];


/*
 * =========================================================
 * 予約されたカード移動を処理
 * =========================================================
 */

function processPendingMoves() {

  /*
   * アニメーション中なら、
   * 現在のアニメーションが終わるまで待つ。
   */
  if (isAnimating) {
    return;
  }


  /*
   * 予約がなければ何もしない。
   */
  if (pendingMoves.length === 0) {
    return;
  }


  /*
   * 一番古い予約を取り出す。
   */
  const move = pendingMoves.shift();


  /*
   * next
   */
  if (move > 0) {

    nextCard();


  /*
   * previous
   */
   } else {

    previousCard();
  }
}


/*
 * =========================================================
 * wheelイベント
 * =========================================================
 */

slider.addEventListener(
  "wheel",
  function(event) {

    /*
     * 横方向のスクロールを無視。
     *
     * deltaYの大きさはここでは一切評価しない。
     */
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      return;
    }


    /*
     * ページスクロールを止める。
     */
    event.preventDefault();


    /*
     * -----------------------------------------------------
     * wheelジェスチャー終了タイマーをリセット
     * -----------------------------------------------------
     */

    clearTimeout(wheelEndTimer);

    wheelEndTimer = setTimeout(
      function() {

        /*
         * wheelが途切れた。
         *
         * 次のwheelを新しいスワイプとして扱える。
         */
        wheelGestureUsed = false;

      },
      WHEEL_END_DELAY
    );


    /*
     * -----------------------------------------------------
     * 同じスワイプから大量に来るwheelを無視
     * -----------------------------------------------------
     */

    if (wheelGestureUsed) {
      return;
    }


    /*
     * -----------------------------------------------------
     * このスワイプを1回分として記録
     * -----------------------------------------------------
     */

    wheelGestureUsed = true;


    /*
     * -----------------------------------------------------
     * スワイプ方向だけを見る
     *
     * 強さは見ない。
     * -----------------------------------------------------
     */

    if (event.deltaY > 0) {

      /*
       * 下 → 次
       */
      pendingMoves.push(1);

    } else if (event.deltaY < 0) {

      /*
       * 上 → 前
       */
      pendingMoves.push(-1);
    }


    /*
     * -----------------------------------------------------
     * 今すぐ処理
     *
     * アニメーション中なら
     * processPendingMoves() 内で待機する。
     * -----------------------------------------------------
     */

    processPendingMoves();

  },
  {
    passive: false
  }
);


/*
 * =========================================================
 * タッチ操作
 * =========================================================
 *
 * .MV 内ではカード操作を完全に無効化。
 *
 * つまり、
 *
 * 動画タイトル
 * iframe
 * 動画周辺の余白
 *
 * のどこから指を動かしても、
 * カードはめくられない。
 */


/*
 * タッチ開始時に
 * カード操作を開始した場所が .MV だったか記録する。
 */
let touchStartedOnMV = false;


/*
 * =========================================================
 * タッチ開始
 * =========================================================
 */

slider.addEventListener(
  "touchstart",
  event => {

    if (event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];

    /*
     * タッチ開始地点の要素を取得。
     *
     * .MV の中なら、
     * タイトルでもiframeでもカード操作を無効にする。
     */
    const target = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );

    touchStartedOnMV =
      target !== null &&
      target.closest(".MV") !== null;


    /*
     * .MV 上から始まった場合は
     * カード用の座標を記録しない。
     */
    if (touchStartedOnMV) {
      touchStartX = 0;
      touchStartY = 0;
      return;
    }


    /*
     * 通常のカードスワイプ。
     */
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

  },
  {
    passive: true
  }
);


/*
 * =========================================================
 * タッチ終了
 * =========================================================
 */

slider.addEventListener(
  "touchend",
  event => {

    /*
     * .MV から始まったタッチなら、
     * カード操作は完全に無視。
     */
    if (touchStartedOnMV) {

      touchStartedOnMV = false;

      touchStartX = 0;
      touchStartY = 0;

      return;
    }


    if (event.changedTouches.length !== 1) {
      return;
    }


    const touch = event.changedTouches[0];

    const deltaX =
      touch.clientX - touchStartX;

    const deltaY =
      touch.clientY - touchStartY;


    /*
     * 縦方向のスワイプなら
     * カード操作しない。
     */
    if (Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }


    /*
     * 小さな移動は無視。
     */
    if (Math.abs(deltaX) < 50) {
      return;
    }


    /*
     * 左スワイプ → 次
     *
     * 右スワイプ → 前
     */
    if (deltaX < 0) {
      nextCard();
    } else {
      previousCard();
    }

  },
  {
    passive: true
  }
);


  /*
   * =========================================================
   * キーボード操作
   * =========================================================
   *
   * ← → でもカードを操作できるようにする。
   */

  document.addEventListener("keydown", event => {

    /*
     * 入力欄などにフォーカスしている場合は無視。
     */
    const tag = event.target.tagName;

    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT"
    ) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {

      event.preventDefault();

      nextCard();

    } else if (
      event.key === "ArrowUp" ||
      event.key === "ArrowLeft"
    ) {

      event.preventDefault();

      previousCard();
    }
  });


  /*
   * =========================================================
   * リサイズ
   * =========================================================
   */

  window.addEventListener(
    "resize",
    () => {
      updateSliderHeight();
    }
  );


  /*
   * =========================================================
   * iframeなどの読み込み完了後にも高さを再計算
   * =========================================================
   */

  window.addEventListener(
    "load",
    () => {
      updateSliderHeight();
      initialize();
    }
  );


  /*
   * loadより前にJSが実行された場合にも対応。
   */
  if (document.readyState === "complete") {
    initialize();
  }
}

/*
 * =========================================================
 * MV SLIDER
 * =========================================================
 *
 * 動画を循環させるカルーセル。
 *
 * [1] [2] [3]
 *      ↑
 *    active
 *
 * ↓
 *
 * [3] [1] [2]
 *      ↑
 *    active
 *
 * というように循環する。
 */


const mvSlider = document.querySelector(".mv-slider");


if (mvSlider) {

  const mvCards =
    Array.from(
      mvSlider.querySelectorAll(".MV")
    );


  /*
   * 動画が1個以下なら何もしない。
   */
  if (mvCards.length > 1) {

    let mvIndex = 0;

    let mvAnimating = false;


    /*
     * =====================================================
     * 表示更新
     * =====================================================
     */

    function renderMV() {

      const length = mvCards.length;


      mvCards.forEach((card, index) => {

        /*
         * いったん全部消す。
         */
        card.classList.remove(
          "mv-active",
          "mv-prev",
          "mv-next"
        );


        /*
         * 現在位置との差。
         */
        let diff =
          index - mvIndex;


        /*
         * 循環を考慮する。
         *
         * 例：
         *
         * index = 0
         * active = 2
         *
         * 普通なら -2 だが、
         * 循環させると +1。
         */
        if (diff > length / 2) {
          diff -= length;
        }

        if (diff < -length / 2) {
          diff += length;
        }


        /*
         * 中央。
         */
        if (diff === 0) {

          card.classList.add(
            "mv-active"
          );

        }


        /*
         * 左。
         */
        else if (diff === -1) {

          card.classList.add(
            "mv-prev"
          );

        }


        /*
         * 右。
         */
        else if (diff === 1) {

          card.classList.add(
            "mv-next"
          );

        }

      });

    }


    /*
     * =====================================================
     * 次の動画
     * =====================================================
     */

    function nextMV() {

      if (mvAnimating) {
        return;
      }

      mvAnimating = true;


      mvIndex++;

      if (mvIndex >= mvCards.length) {
        mvIndex = 0;
      }


      renderMV();


      setTimeout(() => {

        mvAnimating = false;

      }, 500);

    }


    /*
     * =====================================================
     * 前の動画
     * =====================================================
     */

    function previousMV() {

      if (mvAnimating) {
        return;
      }

      mvAnimating = true;


      mvIndex--;

      if (mvIndex < 0) {
        mvIndex = mvCards.length - 1;
      }


      renderMV();


      setTimeout(() => {

        mvAnimating = false;

      }, 500);

    }


    /*
     * =====================================================
     * マウスホイール
     * =====================================================
     *
     * MVエリアではカード側のwheel操作をさせず、
     * MVカルーセルだけを動かす。
     */

    mvSlider.addEventListener(
      "wheel",
      event => {

        /*
         * 横方向が主体なら次/前。
         */
        if (
          Math.abs(event.deltaX) >
          Math.abs(event.deltaY)
        ) {

          event.preventDefault();

          if (event.deltaX > 0) {
            nextMV();
          } else {
            previousMV();
          }

          return;
        }


        /*
         * 縦wheelはMV側では何もしない。
         */
      },
      {
        passive: false
      }
    );


    /*
     * =====================================================
     * タッチ
     * =====================================================
     */

    let mvTouchStartX = 0;
    let mvTouchStartY = 0;


    mvSlider.addEventListener(
      "touchstart",
      event => {

        if (event.touches.length !== 1) {
          return;
        }

        mvTouchStartX =
          event.touches[0].clientX;

        mvTouchStartY =
          event.touches[0].clientY;

      },
      {
        passive: true
      }
    );


    mvSlider.addEventListener(
      "touchend",
      event => {

        if (event.changedTouches.length !== 1) {
          return;
        }


        const touch =
          event.changedTouches[0];


        const deltaX =
          touch.clientX - mvTouchStartX;


        const deltaY =
          touch.clientY - mvTouchStartY;


        /*
         * 縦方向なら無視。
         */
        if (
          Math.abs(deltaX) <=
          Math.abs(deltaY)
        ) {
          return;
        }


        /*
         * 小さい移動は無視。
         */
        if (
          Math.abs(deltaX) < 50
        ) {
          return;
        }


        /*
         * 左 → 次
         */
        if (deltaX < 0) {

          nextMV();

        }


        /*
         * 右 → 前
         */
        else {

          previousMV();

        }

      },
      {
        passive: true
      }
    );


    /*
     * =====================================================
     * 初期表示
     * =====================================================
     */

    renderMV();

  }

}