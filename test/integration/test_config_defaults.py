import os
from collections import namedtuple
from datetime import timedelta

import pytest
from base.driver_util import GalaxyTestDriver

from galaxy.util import listify


"""
This tests: (1) automatic creation of configuration properties; and
(2) assignment of default values that are specified in the schema and, in
some cases, are also processed at load time (paths resolved, csv strings
converted to lists, etc).

This module will test ALL schema properties, unless they are listed in the
global DO_NOT_TEST. Whenever a property's default value is changed (edits to
schema or configuration loading procedures), this test code must be modified to
reflect that change.

Test assumptions for a default configuration:
- If a default is set and not modified at load time, expect schema default.
- If a default is not set, expect null.
- If a default is set and modified at load time, the test should reflect that
  (if a default is specified in the schema, it is expected that it will be used
  in some form at load time; otherwise it should not be listed as a default).

Configuration options NOT tested:
- config_dir (value overridden for testing)
- data_dir (value overridden for testing)
- new_file_path (value overridden for testing)
- logging (mapping loaded in config/; TODO)
- dependency_resolution (nested properties; TODO)
- job_config (no obvious testable defaults)
"""


OptionData = namedtuple('OptionData', 'key, expected, loaded')


# Most of these (except root_dir) will go away once path_resolves_to is set in the schema
RESOLVE = {
    'sanitize_whitelist_file': 'root_dir',
    'tool_data_path': 'root_dir',
    'involucro_path': 'root_dir',
    'tool_path': 'root_dir',
    'integrated_tool_panel_config': 'config_dir',
    'shed_tool_data_path': 'tool_data_path',
    'builds_file_path': 'tool_data_path',
    'len_file_path': 'tool_data_path',
}

CUSTOM = {
    'password_expiration_period': timedelta,
    'toolbox_filter_base_modules': listify,
    'mulled_channels': listify,
    'user_library_import_symlink_whitelist': listify,
    'tool_filters': listify,
    'tool_label_filters': listify,
    'tool_section_filters': listify,
    'persistent_communication_rooms': listify,
}

# TODO: split into (1) do not test; and (2) todo: fix and test
DO_NOT_TEST = [
    'config_dir',  # value overridden for testing
    'data_dir',  # value overridden for testing
    'new_file_path',  # value overridden for testing
    'logging',  # mapping loaded in config/
    'dependency_resolution',  # nested properties
    'job_config',  # no obvious testable defaults
    'database_connection',  # untestable; refactor config/__init__ to test
    'database_engine_option_pool_size',  # overridden for tests runnign on non-sqlite databases
    'database_engine_option_max_overflow',  # overridden for tests running on non-sqlite databases
    'database_template',  # default value set for tests
    'tool_config_file',  # default not used; may or may not be testable
    'shed_tool_config_file',  # broken: remove 'config/' prefix from schema
    'dependency_resolvers_config_file',  # broken: remove 'config/' prefix from schema
    'conda_auto_init',  # broken: default overridden
    'tool_sheds_config_file',  # broken: remove 'config/' prefix from schema
    'tool_data_table_config_path',  # broken: remove 'config/' prefix from schema
    'shed_tool_data_table_config',  # broken: remove 'config/' prefix from schema
    'datatypes_config_file',  # broken: remove 'config/' prefix from schema
    'webhooks_dir',  # broken; also remove 'config/' prefix from schema
    'job_working_directory',  # broken; may or may not be able to test
    'template_cache_path',  # may or may not be able to test; may be broken
    'object_store_config_file',  # broken: remove 'config/' prefix from schema
    'object_store_store_by',  # broken: default overridden
    'pretty_datetime_format',  # untestable; refactor config/__init__ to test
    'user_preferences_extra_conf_path',  # broken: remove 'config/' prefix from schema
    'default_locale',  # broken
    'galaxy_infrastructure_url',  # broken
    'galaxy_infrastructure_web_port',  # broken
    'chunk_upload_size',  # broken: default overridden
    'monitor_thread_join_timeout',  # broken: default overridden
    'heartbeat_log',  # untestable; refactor config/__init__ to test
    'statsd_host',  # broken: default overridden with empty string
    'library_import_dir',  # broken: default overridden
    'user_library_import_dir',  # broken: default overridden
    'disable_library_comptypes',  # broken: default overridden with empty string
    'tool_test_data_directories',  # untestable; refactor config/__init__ to test
    'id_secret',  # broken: default overridden
    'use_remote_user',  # broken: default overridden
    'admin_users',  # may or may not be testable: special test value assigned
    'allow_user_deletion',  # broken: default overridden
    'oidc_config_file',  # broken: remove 'config/' prefix from schema
    'oidc_backends_config_file',  # broken: remove 'config/' prefix from schema
    'auth_config_file',  # broken: remove 'config/' prefix from schema
    'api_allow_run_as',  # may or may not be testable: test value assigned
    'master_api_key',  # broken: default value assigned outside of config/
    'ftp_upload_purge',  # broken: default overridden
    'expose_dataset_path',  # broken: default overridden
    'data_manager_config_file',  # broken: remove 'config/' prefix from schema
    'shed_data_manager_config_file',  # broken: remove 'config/' prefix from schema
    'galaxy_data_manager_data_path',  # broken: review config/, possibly refactor
    'job_config_file',  # broken: remove 'config/' prefix from schema
    'use_tasked_jobs',  # broken: default overridden
    'retry_metadata_internally',  # broken: default overridden
    'cleanup_job',  # broken: default overridden
    'job_resource_params_file',  # broken: remove 'config/' prefix from schema
    'workflow_resource_params_file',  # broken: remove 'config/' prefix from schema
    'workflow_resource_params_mapper',  # broken: remove 'config/' prefix from schema
    'workflow_schedulers_config_file',  # broken: remove 'config/' prefix from schema
    'user_tool_filters',  # broken: default overridden
    'user_tool_section_filters',  # broken: default overridden
    'user_tool_label_filters',  # broken: default overridden
    'amqp_internal_connection',  # may or may not be testable; refactor config/
    'migrated_tools_config',  # needs more work (should work)
]


@pytest.fixture(scope='module')
def driver(request):
    request.addfinalizer(DRIVER.tear_down)
    return DRIVER


def create_driver():
    # Same approach as in functional/test_toolbox_pytest.py:
    # We setup a global driver, so that the driver fixture can tear down the driver.
    # Ideally `create_driver` would be a fixture and clean up after the yield,
    # but that's not compatible with the use use of pytest.mark.parametrize:
    # a fixture is not directly callable, so it cannot be used in place of get_config_data.
    global DRIVER
    DRIVER = GalaxyTestDriver()
    DRIVER.setup()


def get_config_data():

    def load_parent_dirs():
        return {
            'root_dir': DRIVER.app.config.root,
            'config_dir': DRIVER.app.config.config_dir,
            'data_dir': DRIVER.app.config.data_dir,
            'tool_data_path': DRIVER.app.config.tool_data_path,
        }

    def resolve(parent, child):
        return os.path.join(parent, child) if child else parent

    def get_expected(key, data, parent_dirs):
        value = data.get('default')
        parent = data.get('path_resolves_to')
        if parent:
            value = resolve(parent_dirs[parent], value)
        if key in RESOLVE:
            parent = RESOLVE[key]
            value = resolve(parent_dirs[parent], value)
        if key in CUSTOM:
            value = CUSTOM[key](value)
        return value

    create_driver()  # create + setup DRIVER
    parent_dirs = load_parent_dirs()  # called after DRIVER is setup
    items = ((k, v) for k, v in DRIVER.app.config.appschema.items() if k not in DO_NOT_TEST)
    for key, data in items:
        expected_value = get_expected(key, data, parent_dirs)
        loaded_value = getattr(DRIVER.app.config, key)
        data = OptionData(key=key, expected=expected_value, loaded=loaded_value)  # passed to test
        yield pytest.param(data)


def get_key(option_data):
    return option_data.key


@pytest.mark.parametrize('data', get_config_data(), ids=get_key)
def test_config_option(data, driver):
    assert data.expected == data.loaded
