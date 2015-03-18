define(["utils/utils","mvc/tools/tools-form-base"],function(a,b){var c=b.extend({initialize:function(c){if(this.node=workflow.active_node,!this.node)return void console.debug("FAILED - tools-form-workflow:initialize() - Node not found in workflow.");this.post_job_actions=this.node.post_job_actions||{},c=a.merge(c,{text_enable:"Set in Advance",text_disable:"Set at Runtime",is_dynamic:!1,narrow:!0,initial_errors:!0,cls:"ui-portlet-narrow",update_url:galaxy_config.root+"api/workflows/build_module",update:function(a){d.node.update_field_data(a),d.form.errors(a&&a.tool_model)}}),a.deepeach(c.inputs,function(a){a.type&&(a.optional=-1==["data","data_hidden","hidden","repeat","conditional"].indexOf(a.type))}),a.deepeach(c.inputs,function(a){a.type&&"conditional"==a.type&&(a.test_param.optional=!1)});var d=this;a.get({url:galaxy_config.root+"api/datatypes",cache:!0,success:function(a){d.datatypes=a,d._makeSections(c.inputs),b.prototype.initialize.call(d,c)}})},_makeSections:function(b){b[a.uid()]={label:"Annotation / Notes",name:"annotation",type:"text",area:!0,help:"Add an annotation or note for this step. It will be shown with the workflow.",value:this.node.annotation};var c=this.node.output_terminals&&Object.keys(this.node.output_terminals)[0];if(c){b[a.uid()]={name:"pja__"+c+"__EmailAction",label:"Email notification",type:"boolean",value:String(Boolean(this.post_job_actions["EmailAction"+c])),ignore:"false",help:"An email notification will be send when the job has completed.",payload:{host:window.location.host}},b[a.uid()]={name:"pja__"+c+"__DeleteIntermediatesAction",label:"Output cleanup",type:"boolean",value:String(Boolean(this.post_job_actions["DeleteIntermediatesAction"+c])),ignore:"false",help:"Delete intermediate outputs if they are not used as input for another job."};for(var d in this.node.output_terminals)b[a.uid()]=this._makeSection(d)}},_makeSection:function(a){function b(c,d){d=d||[],d.push(c);for(var f in c.inputs){var g=c.inputs[f];if(g.action){if(g.name="pja__"+a+"__"+g.action,g.argument&&(g.name+="__"+g.argument),g.payload)for(var h in g.payload){var i=g.payload[h];g.payload[g.name+"__"+h]=i,delete i}var j=e.post_job_actions[g.action+a];if(j){for(var k in d)d[k].expand=!0;g.value=g.argument?j.action_arguments&&j.action_arguments[g.argument]||g.value:"true"}}g.inputs&&b(g,d.slice(0))}}var c=[];for(key in this.datatypes)c.push({0:this.datatypes[key],1:this.datatypes[key]});c.sort(function(a,b){return a.label>b.label?1:a.label<b.label?-1:0}),c.unshift({0:"Sequences",1:"Sequences"}),c.unshift({0:"Roadmaps",1:"Roadmaps"}),c.unshift({0:"Leave unchanged",1:"__empty__"});var d={label:"Add Actions: '"+a+"'",type:"section",inputs:[{action:"RenameDatasetAction",argument:"newname",label:"Rename dataset",type:"text",value:"",ignore:"",help:'This action will rename the result dataset. Click <a href="https://wiki.galaxyproject.org/Learn/AdvancedWorkflow/Variables">here</a> for more information.'},{action:"ChangeDatatypeAction",argument:"newtype",label:"Change datatype",type:"select",ignore:"__empty__",value:"__empty__",options:c,help:"This action will change the datatype of the output to the indicated value."},{action:"TagDatasetAction",argument:"tags",label:"Tags",type:"text",value:"",ignore:"",help:"This action will set tags for the dataset."},{label:"Assign columns",type:"section",inputs:[{action:"ColumnSetAction",argument:"chromCol",label:"Chrom column",type:"integer",value:"",ignore:""},{action:"ColumnSetAction",argument:"startCol",label:"Start column",type:"integer",value:"",ignore:""},{action:"ColumnSetAction",argument:"endCol",label:"End column",type:"integer",value:"",ignore:""},{action:"ColumnSetAction",argument:"strandCol",label:"Strand column",type:"integer",value:"",ignore:""},{action:"ColumnSetAction",argument:"nameCol",label:"Name column",type:"integer",value:"",ignore:""}],help:"This action will set column assignments in the output dataset. Blank fields are ignored."}]},e=this;return b(d),d}});return{View:c}});
//# sourceMappingURL=../../../maps/mvc/tools/tools-form-workflow.js.map