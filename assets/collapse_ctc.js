var EPS = 'ϵ';
var LOADED = false;

$(document).ready(function() {
    update();
    $("#alignment").blur();
    LOADED = true;
});

$("#epsilon").click(function() {
    insert_epsilon();
    update();
});

$("#alignment").mousedown(function(e) {
    e.preventDefault();
    placeCaretAtEnd();
});

function first_focus() {
    if (LOADED) {
        var ali = $("#alignment");
        ali.html("");
        ali.off("focus", first_focus);
    }
    update();
}

$("#alignment").focus(first_focus);

$("#alignment").keydown(function(e) {
    // Disable movement.
    if (e.keyCode >= 37 && e.keyCode <= 40) {
        e.preventDefault();
    }
    // Handle holding backspace.
    if (e.keyCode == 8)
        update();
});

$("#alignment").keyup(function(e) {
    // Handle backspace.
    if (e.keyCode == 8)
        update();
});

$("#alignment").keypress(function(e) {
    e.preventDefault();
    var alignment = $("#alignment");
   
    // Return inputs an epsilon
    if(e.keyCode == 13) {
        insert_epsilon();
    } else {
        ali_text = alignment.html();
        ali_text += String.fromCharCode(e.keyCode);
        alignment.html(ali_text);
    }
    update();
});

function update() {
    var alignment = $("#alignment");
    placeCaretAtEnd();
    update_output();
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
    eps_span.css("padding-left","3px");
    eps_span.css("padding-right","3px");
    alignment.append(eps_span);
}

function add_rects(groups) {
    return groups.append("rect")
          .attr("width", 40)
          .attr("height", 40)
          .attr("fill", "#d3d3d3");
}

function add_text(groups) {
    return groups.append("text")
          .attr("x", 20)
          .attr("y", 30)
          .attr("text-anchor", "middle");
}

function update_alignment(alignment) {
    var groups = d3.select("#align_g").selectAll("g");
    groups = groups.data(alignment.split(""));
    groups.exit().remove()
    groups = groups.enter()
          .append("g")
          .attr("transform", function(d, i) {
             return "translate(" + i * 42 + ",0)";
           });
    add_rects(groups);
    add_text(groups).attr("class", function(d) {
                  if (d == EPS)
                      return "align_epsilon";
                  else
                      return "align_text";
               })
          .text(function(d) { return d;});
}

function update_merged(merged) {
    groups = d3.select("#merge_g").selectAll("g");
    groups = groups.data(merged);
    groups.exit().remove();

    groups.select("rect")
          .attr("width", function(d) { return (d["end"] - d["start"]) * 42 - 2; });

    groups = groups.enter()
          .append("g")
          .attr("transform", function(d) {
              return "translate(" + d["start"] * 42 + ",0)";
          })
          .attr("opacity", function(d) {
              var t = d["char"];
              if (t == EPS) return 0.6;
              return 1;
          });
    rects = add_rects(groups);
    rects.attr("width", function(d) { return (d["end"] - d["start"]) * 42 - 2; });
    add_text(groups).attr("class", "align_text")
          .text(function(d) {
              var t = d["char"];
              if (t == EPS) return "";
              return t;
          });
} 

function update_final(collapsed) {
    var groups = d3.select("#final_g").selectAll("g");
    groups = groups.data(collapsed)
    groups.exit().remove()
    groups = groups.enter()
          .append("g")
          .attr("transform", function(d, i) {
              return "translate(" + i * 42 + ",0)";
          })
    add_rects(groups);
    text = add_text(groups).attr("class", "align_text")
          .text(function(d) { return d; });
}

function update_output() {
    var alignment = $("#alignment").text();
    update_alignment(alignment);

    merged = merge(alignment);
    update_merged(merged);

    // The final output.
    collapsed = []
    for (var i = 0; i < merged.length; i++) {
        var c = merged[i]["char"];
        if (c != EPS)
            collapsed.push(c);
    }
    update_final(collapsed);
}

function merge(alignment) {
    var output = [];
    for (var i = 0; i < alignment.length; i++) {
        if (i != 0 && alignment[i] == alignment[i-1]) {
            output[output.length - 1]["end"] = i + 1;
        } else {
            output.push({"char" : alignment[i], "start": i, "end" : i + 1});
        }
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
