People = new Meteor.Collection("people");
Names = new Meteor.Collection("names");
PersonalFacts = new Meteor.Collection("personalfacts");
function getCurrentPerson() {
    var id = Session.get("person");
    if(id == undefined) {
        return undefined;
    }
    return People.findOne({UserID:id.toString()});
}
Template.personinfo.rendered = function () {
    var id = Session.get("person");
    console.log("Personinfo ID:", id);
    var p = People.findOne({UserID:id.toString()});
    console.log("Personinfo Person:", p);
}

Template.personinfo.headingname = function() {
    var person = getCurrentPerson();
    if(! person) {
        return "...loading...";
    }
    var name = Names.findOne({PersonID:{ID:person.ID}});
    console.log("Name", name);
    return name.Surname + ", " + name.Given;
};
Template.personinfo.fullname = function() {
    var person = getCurrentPerson();
    if(! person) {
        return "...loading...";
    }
    var name = Names.findOne({PersonID:{ID:person.ID}});
    if( name.Title != undefined) {
        return name.Surname + ", " + name.Given + "[" + name.Title + "]";
    }
    return name.Surname + ", " + name.Given ;
};

Template.personinfo.sex = function() {
    var person = getCurrentPerson();
    if(! person) {
        return "...loading...";
    }
    if( person.BirthSex == "Male") {
        return "Man";
    }
    if( person.BirthSex == "Female") {
        return "Kvinna";
    }
    return person.BirthSex.toString();
};
function pad(a,b){return(1e15+a+"").slice(-b)}
function dateValToString(dateval) {
    var modifier = "";
    if( dateval.Modifier == "Circa" ) {
        modifier = "ca. ";
    }
    if( dateval.Year && dateval.Month  && dateval.Day) {
        return modifier + pad(dateval.Year,4) +"-"+ pad(dateval.Month,2) +"-"+ pad(dateval.Day,2);
    }
    if( dateval.Year && dateval.Month) {
        return modifier + pad(dateval.Year,4) +"-"+ pad(dateval.Month,2);
    }
    if( dateval.Year) {
        return modifier + pad(dateval.Year,4);
    }
    return modifier;
};
function dateToString(date) {
    if(! date) {
        return "";
    }
    if(date.Type == "Single") {
        var startVal = date.StartDate.DateVal;
        return dateValToString(startVal);
    }
    if(date.Type == "Range") {
        var startVal = date.StartDate.DateVal;
        var endVal = date.EndDate.DateVal;
        return dateValToString(startVal) + " - " + dateValToString(endVal);
    }
    return "---";
};

birthDate = function() {
    var person = getCurrentPerson();
    if(! person) {
        return "";
    }
    var birth = PersonalFacts.findOne({ReferenceID:{ID:person.ID},Type:"Birth"});
    if(! birth) {
        return "";
    }
    return dateToString(birth.Date);
}

deathDate = function() {
    var person = getCurrentPerson();
    if(! person) {
        return "";
    }
    var death = PersonalFacts.findOne({ReferenceID:{ID:person.ID},Type:"Death"});
    if(! death) {
        return "";
    }
    return dateToString(death.Date);
}

birthLocation = function() {
    var person = getCurrentPerson();
    if(! person) {
        return "---";
    }
    var birth = PersonalFacts.findOne({ReferenceID:{ID:person.ID},Type:"Birth"});
    if(! birth) {
        return "...";
    }
    console.log("birthLocation: birth ", birth);

    return "" + birth.Place;
}

Template.personinfo.born = function() {
    var person = getCurrentPerson();
    if(! person) {
        return "...loading...";
    }
    var birth = PersonalFacts.findOne({ReferenceID:{ID:person.ID},Type:"Birth"});
    if(! birth) {
        return "<N/A>";
    }
    return dateToString(birth.Date) + " " + birth.Place;
};
Template.personinfo.facts = function() {
    var person = getCurrentPerson();
    if(! person) {
        return [];
    }
    return PersonalFacts.find({ReferenceID:{ID:person.ID}});
};
function typeToString(type) {
    switch(type) {
        case "Birth":
            return "Född";
        case "Occupation":
            return "Sysselsättning";
        case "Residence":
            return "Bostad";
        case "Education":
            return "Utbildning";
    }
    return type.toString();
};

Template.personFact.factname = function() {
    return typeToString(this.Type);
}
Template.personFact.factdata = function() {
    console.log(this);
    switch(this.Type) {
        case "Birth":
            if( this.Place != undefined) {
                return dateToString(this.Date) + " " + this.Place.toString(); 
            }
            return dateToString(this.Date);
        case "Occupation":
            return dateToString(this.Date) + " " + this.Detail.toString();
        case "Residence":
            return dateToString(this.Date) + " " + this.Place.toString();
        case "Education":
            return dateToString(this.Date) + " " + this.Detail.toString();
    }
    return dateToString(this.Date) + "...";
};

