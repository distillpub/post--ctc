import {select as d3Select} from 'd3-selection';
import $ from 'jquery';

var EPS = 'ϵ';
var LOADED = false;
var MAX_LEN = 16;
var TIMEOUTS = []
var ANIM = null;


function animation() {
    var t = 300
    var hello = ['hee', EPS, 'l', EPS, 'lloo!'].join("");
    var world = ['wwo', EPS, 'rrr', EPS, 'lld!'].join("")
    var i;
    for (i = 0; i <= hello.length; i++) {
        TIMEOUTS.push(setTimeout(update, i * t, hello.substr(0,i)));
    }
    i += 5;
    for (var j = hello.length - 1; j >= 0; j--) {
        TIMEOUTS.push(setTimeout(update, i * t, hello.substr(0,j)));
        i ++;
    }
    for (var j = 0; j <= world.length; j++) {
        TIMEOUTS.push(setTimeout(update, i * t, world.substr(0,j)));
        i++;
    }
    i += 5
    for (var j = world.length - 1; j >= 0; j--) {
        TIMEOUTS.push(setTimeout(update, i * t, world.substr(0,j)));
        i++;
    }
}

$(document).ready(function() {
    animation();
    ANIM = setInterval(animation, 18000);
});

function clear_and_load() {
    clearInterval(ANIM);
    for (var i = 0; i < TIMEOUTS.length; i++)
        clearTimeout(TIMEOUTS[i]);
    LOADED = true;
}

$("#alignment").mousedown(function(e) {
    e.preventDefault();
    if (!LOADED) {
        clear_and_load();
        update($("#alignment").text());
    }
    place_caret();
});

$("#alignment").keydown(function(e) {
    // Disable movement.
    if (e.keyCode >= 37 && e.keyCode <= 40) {
        e.preventDefault();
    }
    if (e.keyCode == 8) {
        e.preventDefault();
        if (!LOADED) {
            clear_and_load();
            return;
        }
        var alignment = $("#alignment").text();
        alignment = alignment.substr(0, alignment.length - 1);
        update(alignment);
    }
});

$("#alignment").keyup(function(e) {

    // Hack for Android
    if (e.keyCode == 229) {
      var text = $("#alignment").text();
      $("#alignment").text("");
      update(text);
    }

    if (e.keyCode != 32)
        return;

    // Hack for double space causing period + ' '.
    var last_div = $("#alignment > div").last()
    var t = last_div.text()
    if (t == " . ")
        last_div.text(".");
    update($("#alignment").text());
});

$("#alignment").keypress(function(e) {
    e.preventDefault();

    if (!LOADED) {
        clear_and_load();
    }

    var alignment = $("#alignment").text();

    // Return inputs an epsilon
    if (alignment.length >= MAX_LEN) {
        // Flash red bar to denote end.
        var div = $("<span>");
        div.attr("id", "red_bar_overflow")
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

    // Only place the cursor if we have focus
    var ali = document.getElementById('alignment');
    var is_focused = (document.activeElement == ali);
    if (is_focused)
        place_caret();
}

function add_rects(groups) {
    return groups.append("rect")
          .attr("width", 40)
          .attr("height", 40)
          .attr("fill", "#f0f0f0");
}

function add_text(groups) {
    return groups.append("text")
          .attr("x", 20)
          .attr("y", 30)
          .attr("text-anchor", "middle");
}

function update_alignment(alignment) {
    var divs = d3Select("#alignment")
                   .selectAll("div")
                   .data(alignment.split(""));
    divs.enter()
        .append("div")
        .merge(divs)
        .text(function(d) { return d;})
        .attr("class", function(d) {
             if (d == EPS) return "align_epsilon";
             else return "align_text";
        });
    divs.exit().remove();

    if (!LOADED){
        var last_div = d3Select("#alignment").select("div:last-child").nodes();
        if (last_div.length > 0) {
            var last_letter = alignment[alignment.length - 1];
            var span = "<span style=\"border-right:1px solid\">";
            last_div[0].innerHTML = span + last_letter + "</span>";
        }
    }
}

function compute_paths(d, i) {
    var s = 42 * d["start"];
    var w = 42 * (d["end"] - d["start"]) - 2;
    var c1 = (i + 1) * 42 - 2;
    var path = "M " + s + " 0 ";
    path += "H " + (s + w);
    path += " V 80 ";
    path += " C " + (s + w) + " 89 " + c1 + " 109 " + c1 + " " + 120;
    path += " V 160 H " + (c1 - 40);
    path += " V 120";
    path += " C " +  (c1 - 40) + " 111 " + s + " 91 " + s + " " + 80;
    path += " Z";
    return path;
}

function draw_highlights(merged_eps) {
    var merged = merged_eps.filter(function(d)
                       { return d["char"] != EPS;});
    var paths = d3Select("#collapse_output")
                   .select("#paths")
                   .selectAll("path")
                   .data(merged);
    paths.exit().remove();
    paths.enter()
         .append("path")
         .merge(paths)
         .attr("d", compute_paths)
         .attr("fill", "#4682b4")
         .attr("opacity", 0.2);
}

function update_merged(merged) {
    var groups = d3Select("#merge_g").selectAll("g");
    groups = groups.data(merged);
    groups.exit().remove();

    var rects = groups.select("rect");
    var text = groups.select("text");

    groups = groups.enter()
          .append("g")
          .attr("transform", function(d) {
              return "translate(" + d["start"] * 42 + ",0)";
          });
    add_rects(groups)
        .merge(rects)
        .attr("width", function(d) { return (d["end"] - d["start"]) * 42 - 2; });
    add_text(groups)
          .merge(text)
          .text(function(d) {
              var t = d["char"];
              if (t == EPS) return "";
              return t;
          });
}

function update_final(collapsed) {
    var groups = d3Select("#final_g").selectAll("g");
    groups = groups.data(collapsed)
    var text = groups.select("text");
    groups.exit().remove()
    groups = groups.enter()
          .append("g")
          .attr("transform", function(d, i) {
              return "translate(" + i * 42 + ",0)";
          })
    add_rects(groups);
    add_text(groups)
          .merge(text)
          .text(function(d) { return d; });
}

function update_output(alignment) {
    update_alignment(alignment);

    let merged = merge(alignment);
    update_merged(merged);
    draw_highlights(merged);

    // The final output.
    let collapsed = []
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
function place_caret(pos) {
    var el = document.getElementById("alignment");
    pos = (typeof pos !== 'undefined') ?  pos : $("#alignment").text().length;

    el.focus();
    if (typeof window.getSelection != "undefined"
        && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.setStart(el, pos);
        range.setEnd(el, pos)
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
