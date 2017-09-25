var EPS = 'ϵ';

$(document).ready(update())

$("#epsilon").click(function() {
    insert_epsilon();
    update();
});

$("#alignment").mousedown(function(e) {
    e.preventDefault();
    placeCaretAtEnd();
});

$("#alignment").keydown(function(e) {
    // Disable movement.
    if (e.keyCode >= 37 && e.keyCode <= 40) {
        e.preventDefault();
    }
    // Handle holding backspace.
    if (e.keyCode == 8)
        update(false);
});

$("#alignment").keyup(function(e) {
    // Handle backspace.
    if (e.keyCode == 8)
        update(false);
});

$("#alignment").keypress(function(e) {
    e.preventDefault();
    var alignment = $("#alignment");
   
    // Return inputs an epsilon
    if(e.keyCode == 13) {
        insert_epsilon();
    } else {
        ali_text = alignment.html();
        alignment.html(ali_text + String.fromCharCode(e.keyCode));
    }
    update();
});

function update(animate) {
    var alignment = $("#alignment");
    placeCaretAtEnd();
    update_output(animate);
    var div = alignment.get()[0]
    alignment.scrollLeft(div.scrollWidth - div.clientWidth);
    check_empty()
}

function check_empty() {
    var alignment = $("#alignment");
    if (alignment.text().length == 0)
        alignment.html("");
}

function insert_epsilon() {
    var alignment = $("#alignment");
    eps_span = $("<span>");
    eps_span.html(EPS);
    eps_span.css("font-family","STIXGeneral-Italic");
    alignment.append(eps_span);
}

function update_output(anim) {
    var  animate = (typeof anim !== 'undefined') ?  animate : true;

    var out = $("#collapse_output");
    var ali_text = $("#alignment").text();
    var collapsed = ctc_collapse(ali_text);
    out.html("");
    for (var i = 0; i < collapsed.length - 1; i++)
        out.append("<div>" + collapsed[i] + "</div>");

    var ali_len = ali_text.length;
    if (ali_len == 0)
        return;

    var last_char = "";
    if (collapsed.length > 0) {
        last_char = $("<div/>");
        last_char.html(collapsed[collapsed.length-1]);
    }
        
    if (ali_text[ali_len - 1] == EPS) {
        // Add an epsilon
        out.append(last_char);
        var eps_div = $("<div/>");
        eps_div.html(EPS);
        eps_div.css("font-family", "STIXGeneral-Italic");

        if (animate) {
            eps_div.addClass("latest");
            out.append(eps_div);
            $(".latest").fadeTo(500, 0.2);
        } else {
            eps_div.css("opacity", "0.2");
            out.append(eps_div)
        }
    } else if (ali_text.length > 1 && ali_text[ali_len -1] == ali_text[ali_len - 2]) {
        // Add a repeat
        out.append(last_char);
        if (animate) { 
            var repeat = $("<div/>");
            repeat.html(ali_text[ali_len - 1]);
            repeat.addClass("latest");
            out.append(repeat);
            $(".latest").fadeOut(500);
        }
    } else {
        // Add a new character
        if (animate) {
            last_char.css("display", "none");
            last_char.addClass("latest");
            out.append(last_char);
            $(".latest").fadeIn(500);
        } else {
            out.append(last_char);
        }
    }
}

function ctc_collapse(alignment) {
    var output = "";
    for (var i = 0; i < alignment.length; i++) {
        if (alignment[i] == EPS)
            continue;
        if (i != 0 && alignment[i] == alignment[i-1])
            continue;
        output += alignment[i];
    }
    return output;
}

// https://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
function placeCaretAtEnd() {
    var el = document.getElementById("alignment")
    el.focus();
    if (typeof window.getSelection != "undefined"
        && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}
