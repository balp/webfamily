/*
   Header
   Names
   PersonalFacts
   FamilyFacts
   People
   Families
   Children
   Notes
   Sources
   PersonalAttachments
   FamilyAttachments
   */
Header = new Meteor.Collection("header");
Names = new Meteor.Collection("names");
PersonalFacts = new Meteor.Collection("personalfacts");
FamilyFacts = new Meteor.Collection("familyfacts");
People = new Meteor.Collection("people");
Families = new Meteor.Collection("families");
Children = new Meteor.Collection("children");
Notes = new Meteor.Collection("notes");
Sources = new Meteor.Collection("sources");
PersonalAttachments = new Meteor.Collection("personalattachments");
FamilyAttachments = new Meteor.Collection("familyattachments");

Meteor.startup(function () {

    console.log('starting up');
    if(Header.find({}).count() != 1) {
        Header.remove({});
        Names.remove({});
        PersonalFacts.remove({});
        FamilyFacts.remove({});
        People.remove({});
        Families.remove({});
        Children.remove({});
        Notes.remove({});
        Sources.remove({});
        PersonalAttachments.remove({});
        FamilyAttachments.remove({});

        var fs = Npm.require('fs');
        //var util = Npm.require('util');
        var data = fs.readFileSync('assets/app/Arnholm.sgx', 'utf8');
        //console.log('Got Data:', data);
        parser = new xml2js.Parser({mergeAttrs:true, explicitArray:false, attrkey: 'attributes', charkey: '_'})
            parser.parseString(data, function (err, result) {
                console.dir(result);
                //console.log(util.inspect(result, false, null))
                //console.log(result.ScionPC.Header);
                Header.insert(result.ScionPC.Header);
                //console.log("Names", JSON.stringify(result.ScionPC.Names["Name"]));
                result.ScionPC.Names["Name"].forEach( function(name) {
                    Names.insert(name);
                });
                result.ScionPC.PersonalFacts["Fact"].forEach( function(fact) {
                    PersonalFacts.insert(fact);
                });
                result.ScionPC.FamilyFacts["Fact"].forEach( function(fact) {
                    FamilyFacts.insert(fact);
                });
                result.ScionPC.People["Person"].forEach( function(person) {
                    People.insert(person);
                });
                result.ScionPC.Families["Family"].forEach( function(family) {
                    Families.insert(family);
                });
                result.ScionPC.Children["Child"].forEach( function(child) {
                    Children.insert(child);
                });
                result.ScionPC.Notes["Note"].forEach( function(note) {
                    Notes.insert(note);
                });
                result.ScionPC.Sources["Source"].forEach( function(source) {
                    Sources.insert(source);
                });
                result.ScionPC.PersonalAttachments["Attachment"].forEach( function(attachment) {
                    PersonalAttachments.insert(attachment);
                });
                result.ScionPC.FamilyAttachments["Attachment"].forEach( function(attachment) {
                    FamilyAttachments.insert(attachment);
                });
            });
    }
});

