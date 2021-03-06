import axios from "axios";
import { getAppRoot } from "onload/loadConfig";
import { getGalaxyInstance } from "app";

/** Request repositories, categories etc from toolshed server **/
export class Services {
    async getCategories(toolshedUrl) {
        const paramsString = `tool_shed_url=${toolshedUrl}&controller=categories`;
        const url = `${getAppRoot()}api/tool_shed/request?${paramsString}`;
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (e) {
            this._errorMessage(e);
        }
    }
    async getRepositories(params) {
        const paramsString = this._getParamsString(params);
        const url = `${getAppRoot()}api/tool_shed/request?controller=repositories&${paramsString}`;
        try {
            const response = await axios.get(url);
            const data = response.data;
            const incoming = data.hits.map(x => x.repository);
            incoming.forEach(x => {
                x.owner = x.repo_owner_username;
                x.times_downloaded = this._formatCount(x.times_downloaded);
                x.repository_url = `${data.hostname}repository?repository_id=${x.id}`;
            });
            return incoming;
        } catch (e) {
            this._errorMessage(e);
        }
    }
    async getRepository(toolshedUrl, repositoryId) {
        const paramsString = `tool_shed_url=${toolshedUrl}&id=${repositoryId}&controller=repositories&action=metadata`;
        const url = `${getAppRoot()}api/tool_shed/request?${paramsString}`;
        try {
            const response = await axios.get(url);
            const data = response.data;
            const table = Object.keys(data).map(key => data[key]);
            if (table.length === 0) {
                throw "Repository does not contain any installable revisions.";
            }
            table.sort((a, b) => b.numeric_revision - a.numeric_revision);
            table.forEach(x => {
                if (Array.isArray(x.tools)) {
                    x.profile = x.tools.reduce(
                        (value, current) => (current.profile > value ? current.profile : value),
                        null
                    );
                }
            });
            return table;
        } catch (e) {
            this._errorMessage(e);
        }
    }
    async getRepositoryByName(toolshedUrl, repositoryName, repositoryOwner) {
        const params = `tool_shed_url=${toolshedUrl}&name=${repositoryName}&owner=${repositoryOwner}`;
        const url = `${getAppRoot()}api/tool_shed/request?controller=repositories&${params}`;
        try {
            const response = await axios.get(url);
            const length = response.data.length;
            if (length > 0) {
                const result = response.data[0];
                result.repository_url = `${toolshedUrl}repository?repository_id=${result.id}`;
                return result;
            } else {
                throw "Repository details not found.";
            }
        } catch (e) {
            this._errorMessage(e);
        }
    }
    async getInstalledRepositories() {
        const Galaxy = getGalaxyInstance();
        const url = `${getAppRoot()}api/tool_shed_repositories/?deleted=false&uninstalled=false`;
        try {
            const response = await axios.get(url);
            const incoming = response.data;
            const repositories = [];
            const hash = {};
            incoming.forEach(x => {
                const hashCode = `${x.name}_${x.owner}`;
                if (!hash[hashCode]) {
                    hash[hashCode] = true;
                    for (const url of Galaxy.config.tool_shed_urls) {
                        if (url.includes(x.tool_shed)) {
                            x.tool_shed_url = url;
                            break;
                        }
                    }
                    repositories.push(x);
                }
            });
            return repositories;
        } catch (e) {
            this._errorMessage(e);
        }
    }
    async getInstalledRepositoriesByName(repositoryName, repositoryOwner) {
        const paramsString = `name=${repositoryName}&owner=${repositoryOwner}`;
        const url = `${getAppRoot()}api/tool_shed_repositories?${paramsString}`;
        try {
            const response = await axios.get(url);
            const data = response.data;
            const result = {};
            data.forEach(x => {
                const d = {
                    status: x.status,
                    installed: !x.deleted && !x.uninstalled
                };
                result[x.changeset_revision] = result[x.installed_changeset_revision] = d;
            });
            return result;
        } catch (e) {
            this._errorMessage(e);
        }
    }
    async installRepository(payload) {
        const url = `${getAppRoot()}api/tool_shed_repositories`;
        try {
            const response = await axios.post(url, payload);
            return response.data;
        } catch (e) {
            this._errorMessage(e);
        }
    }
    async uninstallRepository(params) {
        const paramsString = Object.keys(params).reduce(function(previous, key) {
            return `${previous}${key}=${params[key]}&`;
        }, "");
        const url = `${getAppRoot()}api/tool_shed_repositories?${paramsString}`;
        try {
            const response = await axios.delete(url);
            return response.data;
        } catch (e) {
            this._errorMessage(e);
        }
    }
    _formatCount(value) {
        if (value > 1000) return `>${Math.floor(value / 1000)}k`;
        return value;
    }
    _errorMessage(e) {
        let message = "Request failed.";
        if (e.response) {
            message = e.response.data.err_msg || `${e.response.statusText} (${e.response.status})`;
        } else if (typeof e == "string") {
            message = e;
        }
        throw message;
    }
    _getParamsString(params) {
        return Object.keys(params).reduce(function(previous, key) {
            return `${previous}${key}=${params[key]}&`;
        }, "");
    }
}
