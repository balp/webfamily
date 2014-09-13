//People = new Meteor.Collection("people");
//Names = new Meteor.Collection("names");
//PersonalFacts = new Meteor.Collection("personalfacts");

function buildPedogreeTree(person) {
    console.log("buildPedogreeTree:", person);
    if(! person) {
        console.log("buildPedogreeTree: empty tree");
        return {
          "name": "...",
          "born": '',
          "died": '',
          "location": "",
        }
    }

    var tree = {}
    var name = Names.findOne({PersonID:{ID:person.ID}});
    tree.name = name.Surname + ", " + name.Given ;
    tree.born = birthDate();
    tree.died = deathDate();
    tree.location = birthLocation();

    console.log("buildPedogreeTree: tree", tree);
    return tree;
    console.log("buildPedogreeTree: hardcoded tree");

    return {
  "name": "Clifford Shanks",
  "born": 1862,
  "died": 1906,
  "location": "Petersburg, VA",
  "parents": [
    {
      "name": "James Shanks",
      "born": 1831,
      "died": 1884,
      "location": "Petersburg, VA",
      "parents": [
        {
          "name": "Robert Shanks",
          "born": 1781,
          "died": 1871,
          "location": "Ireland/Petersburg, VA"
        },
        {
          "name": "Elizabeth Shanks",
          "born": 1795,
          "died": 1871,
          "location": "Ireland/Petersburg, VA"
        }
      ]
    },
    {
      "name": "Ann Emily Brown",
      "born": 1826,
      "died": 1866,
      "location": "Brunswick/Petersburg, VA",
      "parents": [
        {
          "name": "Henry Brown",
          "born": 1792,
          "died": 1845,
          "location": "Montgomery, NC"
        },
        {
          "name": "Sarah Houchins",
          "born": 1793,
          "died": 1882,
          "location": "Montgomery, NC"
        }
      ]
    }
  ]
}
        
};
function getCurrentPerson() {
    var id = Session.get("person");
    console.log("ID:", id);

    if(id == undefined) {
        return undefined;
    }
    var p = People.findOne({UserID:id.toString()});
    console.log("Person:", p);
    return p;
}
var margin = {top: 1, right: 150, bottom: 1, left: 10};

function elbow(d, i) {
  return "M" + d.source.y + "," + d.source.x
       + "H" + d.target.y + "V" + d.target.x
       + (d.target.children ? "" : "h" + margin.right);
}

function drawTree() {
    var id = Session.get("person");
    console.log("ID:", id);
    var p = People.findOne({UserID:id.toString()});
    console.log("Person:", p);
    var person = getCurrentPerson();
    var root = buildPedogreeTree(person);
    console.log("Familytree:", root);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });
    
    d3.select("#familytree").select("svg").remove();

    var area = d3.select("#familytree");
    var div_width = $("#familytree").width();
    var div_height = $("#familytree").height();
    var width = div_width - margin.left - margin.right;
    var height = div_height - margin.top - margin.bottom;
    console.log("Size:" , div_width, div_height, width, height);
    var pedigreeSVG = d3.select("#familytree")
        .append("svg")
        .attr("width", div_width)
        .attr("height", div_height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var i = 0;
    var tree = d3.layout.tree()
        .separation(function(a, b) { return a.parent === b.parent ? 1 : .5; })
        .children(function(d) { return d.parents; })
        .size([height, width]);
    var nodes = tree.nodes(root);
    var links = tree.links(nodes);
    var link = pedigreeSVG.selectAll(".link")
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", elbow);

    var node = pedigreeSVG.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { 
            return "translate(" + d.y + "," + d.x + ")";
        });
    node.append("text")
        .attr("class", "name")
        .attr("x", 8)
        .attr("y", -6)
        .text(function(d) { return d.name; });

    node.append("text")
        .attr("x", 8)
        .attr("y", 8)
        .attr("dy", ".71em")
        .attr("class", "about lifespan")
        .text(function(d) { return d.born + "–" + d.died; });

    node.append("text")
        .attr("x", 8)
        .attr("y", 8)
        .attr("dy", "1.86em")
        .attr("class", "about location")
        .text(function(d) { return d.location; });


    var link = pedigreeSVG.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", diagonal);
}

Template.familytree.fullname = function() {
    var person = getCurrentPerson();
    drawTree();
    if(! person) {
        return "...loading...";
    }
    var name = Names.findOne({PersonID:{ID:person.ID}});
    if( name.Title != undefined) {
        return name.Surname + ", " + name.Given + "[" + name.Title + "]";
    }
    return name.Surname + ", " + name.Given ;
};

Template.familytree.rendered = function () {
	drawTree();
}
