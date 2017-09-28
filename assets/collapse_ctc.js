var EPS = 'ϵ';
var LOADED = false;
var MAX_LEN = 16;

$(document).ready(function() {
    update('hee' + EPS + 'l' + EPS + 'llooo!');
    $("#alignment").blur();
});

$("#alignment").mousedown(function(e) {
    e.preventDefault();
    if (LOADED)
        placeCaretAtEnd();
    else
        update("");
});

$("#alignment").keydown(function(e) {
    // Disable movement.
    if (e.keyCode >= 37 && e.keyCode <= 40) {
        e.preventDefault();
    }
    if (e.keyCode == 8) {
        e.preventDefault();
        alignment = $("#alignment").text();
        alignment = alignment.substr(0, alignment.length - 1);
        update(alignment);
    }
});

$("#alignment").keypress(function(e) {
    e.preventDefault();
    var alignment = $("#alignment").text();
   
    // Return inputs an epsilon
    if (alignment.length >= MAX_LEN) {
        // Flash red bar to denote end.
        var div = $("<div>");
        div.css("width", "4px")
           .css("position", "absolute")
           .css("left", "674px")
           .css("top", "16px")
           .css("background-color", "red")
           .css("opacity", 0.2)
        div.fadeOut(200);
        $("#alignment").append(div);
        return;
    }
    if(e.keyCode == 13)
        alignment += EPS;
    else
        alignment += String.fromCharCode(e.keyCode);
    
    update(alignment);
});

function update(alignment) {
    update_output(alignment);
    placeCaretAtEnd();
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
    var groups = d3.select("#alignment").selectAll("div");
    groups = groups.data(alignment.split(""));
    groups.text(function(d) { return d;})
          .style("opacity", 1)
          .attr("class", function(d) {
             if (d == EPS) return "align_epsilon";
             else return "align_text";
          });
    groups.exit().text("").style("opacity", 0.2);
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
              if (t == EPS) return 0.5;
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

function update_output(alignment) {
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
    var el = document.getElementById("alignment");
    var len = $("#alignment").text().length;

    el.focus();
    if (typeof window.getSelection != "undefined"
        && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.setStart(el, len);
        range.setEnd(el, len)
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        // TODO check if this works on IE (?)
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}
