//People = new Meteor.Collection("people");
//Names = new Meteor.Collection("names");
//PersonalFacts = new Meteor.Collection("personalfacts");
Children = new Meteor.Collection("children");


function getParents(person) {
    var parents = [];
    var child = Children.find({PersonID:{ID:person.ID}});
    child.forEach( function(child) {
	console.log("getParents: child", child);
	if(child.Parent1Relation != undefined) {
	    var parent = child.Parent1Relation.Relationship;
	    var p = People.findOne({ID:parent.ParentID});
	    parents[parents.length] = p;
	}
	if(child.Parent2Relation != undefined) {
	    var parent = child.Parent2Relation.Relationship;
	    var p = People.findOne({ID:parent.ParentID});
	    parents[parents.length] = p;
	}
	console.log("getParents: parents", parents);

    });
    return parents;
}

function buildPedogreeTree(person, depth) {
    console.log("buildPedogreeTree:", person, " depth: ", depth);
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
    tree.born = birthDate(person);
    tree.died = deathDate(person);
    tree.location = birthLocation(person);
    var parents = [];
    getParents(person).forEach( function(parent) {
	console.log("buildPedogreeTree: parents", parent);
	if(depth < 3) {
	    parents[parents.length] = buildPedogreeTree(parent, depth + 1);
	}
    });
    tree.parents = parents;

    console.log("buildPedogreeTree: tree", tree);
    return tree;
    console.log("buildPedogreeTree: hardcoded tree");
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
var margin = {top: 1, right: 250, bottom: 50, left: 10};

function elbow(d, i) {
  return "M" + d.source.y + "," + d.source.x
       + "H" + d.target.y + "V" + d.target.x
       + (d.target.children ? "" : "h" + margin.right);
}

drawTree = function() {
    var id = Session.get("person");
    console.log("ID:", id);
    var p = People.findOne({UserID:id.toString()});
    console.log("Person:", p);
    var person = getCurrentPerson();
    var root = buildPedogreeTree(person, 0);
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
        .separation(function(a, b) { return a.parent === b.parent ? 1 : .8; })
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
        .attr("textLength", 200)
        .attr("lengthAdjust", "spacingAndGlyphs")
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
