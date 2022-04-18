function init() {
    let markInput = document.createElement("input");
    markInput.type = "text";
    markInput.id = "markInput";
    markInput.style.position = "fixed";
    markInput.style.width = "40px";
    markInput.placeholder = "Mark";
    markInput.readOnly = true;
    document.body.appendChild(markInput);


    function showInput(element) {
        markInput.style.left = element.getBoundingClientRect().x + "px"
        markInput.style.top = element.getBoundingClientRect().y - 20 + "px"
    }

    let trs = document.getElementsByTagName('table')[2].getElementsByTagName('tr')
    for (let i = 2; i < trs.length - 1; i++) {
        let tds = trs[i].getElementsByTagName('td');
        for (let j = 0; j < tds.length - 1; j++) {
            let tabindex = document.createAttribute("tabindex")
            tabindex.value = "0"
            tds[j].attributes.setNamedItem(tabindex);

            let x = document.createAttribute("x")
            x.value = j
            tds[j].attributes.setNamedItem(x);

            let y = document.createAttribute("y")
            y.value = i - 2
            tds[j].attributes.setNamedItem(y);

            tds[j].onmousedown = function (e) {
                if (e.button != 1) return
                e.preventDefault()



                let x = this.attributes.getNamedItem("x").value
                let y = this.attributes.getNamedItem("y").value

                trs[parseInt(y) + 2].getElementsByTagName('td')[x].focus()

                showInput(this.children[0].children[0])
            }
            tds[j].onkeydown = function (e) {
                if (e.key == "Escape") {
                    markInput.value = ""

                    markInput.style.left = "0px"
                    markInput.style.top = "0px"

                    return
                }

                if (e.key == "Backspace") {
                    markInput.value = markInput.value.slice(0, -1)
                    return
                }

                if (!parseInt(e.key) && e.key != "0" && e.key != "н") return

                markInput.value += e.key
            }
        }
    }

    function move(x1, y1) {
        let lastValue = markInput.value
        markInput.value = ""

        if (lastValue != "") {
            let div = document.activeElement.children[0]

            let xhr = new XMLHttpRequest();
            xhr.onloadend = function () {
                if (xhr.status != 200) return

                let span = `<span data-mark-id="${xhr.responseText.split("\n").at(-1)}">${lastValue}</span>`

                if (div.attributes["data-count-mark"].value == '0') {
                    div.innerHTML = span
                } else {
                    div.innerHTML += span
                }

                div.attributes["data-count-mark"].value = parseInt(div.attributes["data-count-mark"].value) + 1
            }


            xhr.open("POST", `https://kbp.by/ej/ajax.php`, true);
            xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded; charset=UTF-8");
            xhr.send(`action=set_mark&student_id=${div.attributes["st-id"].value}&pair_id=${div.attributes["pair-id"].value}&mark_id=0&value=${lastValue}`);
        }

        let x = document.activeElement.attributes.x
        let y = document.activeElement.attributes.y

        if (x == null || y == null) return

        x = parseInt(x.value)
        y = parseInt(y.value)

        if (x == undefined || y == undefined || x + x1 < 0 || y + y1 < 0) return

        trs[y + y1 + 2].getElementsByTagName('td')[x + x1].focus()
        showInput(document.activeElement)
    }

    document.onkeydown = function (e) {
        if (e.key == 'ArrowUp') {
            move(0, -1);
        }
        if (e.key == 'ArrowDown') {
            move(0, 1);
        }
        if (e.key == 'ArrowLeft') {
            move(-1, 0);
        }
        if (e.key == 'ArrowRight') {
            move(1, 0);
        }
    }
}


chrome.action.onClicked.addListener((tab) => {
    if (tab.url != "https://kbp.by/ej/teather_journal.php" && tab.url != "http://kbp.by/ej/teather_journal.php") return

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: init
    });
});
