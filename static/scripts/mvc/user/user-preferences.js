define("mvc/user/user-preferences",["exports","utils/localization","mvc/form/form-view","mvc/ui/ui-misc","utils/query-string-parsing"],function(e,t,i,s,a){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(e,"__esModule",{value:!0});var n=o(t),r=(o(i),o(s)),u=o(a),l=Backbone.Model.extend({initialize:function(e){(e=e||{}).user_id=e.user_id||Galaxy.user.id,this.set({user_id:e.user_id,information:{title:(0,n.default)("Manage information"),description:"Edit your email, addresses and custom parameters or change your username.",url:"api/users/"+e.user_id+"/information/inputs",icon:"fa-user",redirect:"user"},password:{title:(0,n.default)("Change password"),description:(0,n.default)("Allows you to change your login credentials."),icon:"fa-unlock-alt",url:"api/users/"+e.user_id+"/password/inputs",submit_title:"Save password",redirect:"user"},communication:{title:(0,n.default)("Change communication settings"),description:(0,n.default)("Enable or disable the communication feature to chat with other users."),url:"api/users/"+e.user_id+"/communication/inputs",icon:"fa-comments-o",redirect:"user"},permissions:{title:(0,n.default)("Set dataset permissions for new histories"),description:"Grant others default access to newly created histories. Changes made here will only affect histories created after these settings have been stored.",url:"api/users/"+e.user_id+"/permissions/inputs",icon:"fa-users",submit_title:"Save permissions",redirect:"user"},api_key:{title:(0,n.default)("Manage API key"),description:(0,n.default)("Access your current API key or create a new one."),url:"api/users/"+e.user_id+"/api_key/inputs",icon:"fa-key",submit_title:"Create a new key",submit_icon:"fa-check"},toolbox_filters:{title:(0,n.default)("Manage Toolbox filters"),description:(0,n.default)("Customize your Toolbox by displaying or omitting sets of Tools."),url:"api/users/"+e.user_id+"/toolbox_filters/inputs",icon:"fa-filter",submit_title:"Save filters",redirect:"user"},openids:{title:(0,n.default)("Manage OpenIDs"),description:(0,n.default)("Associate OpenIDs with your account."),icon:"fa-openid",onclick:function(){window.location.href=Galaxy.root+"user/openid_manage?cntrller=user&use_panels=True"}},custom_builds:{title:(0,n.default)("Manage custom builds"),description:(0,n.default)("Add or remove custom builds using history datasets."),icon:"fa-cubes",onclick:function(){window.location.href=Galaxy.root+"custom_builds"}},logout:{title:(0,n.default)("Sign out"),description:(0,n.default)("Click here to sign out of all sessions."),icon:"fa-sign-out",onclick:function(){Galaxy.modal.show({title:(0,n.default)("Sign out"),body:"Do you want to continue and sign out of all active sessions?",buttons:{Cancel:function(){Galaxy.modal.hide()},"Sign out":function(){window.location.href=Galaxy.root+"user/logout?session_csrf_token="+Galaxy.session_csrf_token}}})}}})}}),d=Backbone.View.extend({title:(0,n.default)("User Preferences"),initialize:function(){this.model=new l,this.setElement("<div/>"),this.render()},render:function(){var e=this,t=Galaxy.config;$.getJSON(Galaxy.root+"api/users/"+Galaxy.user.id,function(i){e.$preferences=$("<div/>").addClass("ui-panel").append($("<h2/>").append("User preferences")).append($("<p/>").append("You are logged in as <strong>"+_.escape(i.email)+"</strong>.")).append(e.$table=$("<table/>").addClass("ui-panel-table"));var s=u.default.get("message"),a=u.default.get("status");s&&a&&e.$preferences.prepend(new r.default.Message({message:s,status:a}).$el),t.use_remote_user||(e._addLink("information"),e._addLink("password")),t.enable_communication_server&&e._addLink("communication"),e._addLink("custom_builds"),e._addLink("permissions"),e._addLink("api_key"),t.has_user_tool_filters&&e._addLink("toolbox_filters"),t.enable_openid&&!t.use_remote_user&&e._addLink("openids"),Galaxy.session_csrf_token&&e._addLink("logout"),e.$preferences.append(e._templateFooter(i)),e.$el.empty().append(e.$preferences)})},_addLink:function(e){var t=this.model.get(e),i=$(this._templateLink(t)),s=i.find("a");t.onclick?s.on("click",function(){t.onclick()}):s.attr("href",Galaxy.root+"user/"+e),this.$table.append(i)},_templateLink:function(e){return'<tr><td><div class="ui-panel-icon fa '+e.icon+'"></td><td><a class="ui-panel-anchor" href="javascript:void(0)">'+e.title+'</a><div class="ui-form-info">'+e.description+"</div></td></tr>"},_templateFooter:function(e){return'<p class="ui-panel-footer">You are using <strong>'+e.nice_total_disk_usage+"</strong> of disk space in this Galaxy instance. "+(Galaxy.config.enable_quotas?"Your disk quota is: <strong>"+e.quota+"</strong>. ":"")+'Is your usage more than expected? See the <a href="https://galaxyproject.org/learn/managing-datasets/" target="_blank">documentation</a> for tips on how to find all of the data in your account.</p>'}});e.default={View:d,Model:l}});