import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

const DefaultWorkingDirectory: string = "C:\\a\\w\\";

let taskPath = path.join(__dirname, '..\\src\\main.js');
let tr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tr.setInput('templateType', process.env["__template_type__"] || 'builtin');
tr.setInput('azureResourceGroup', 'testrg');
tr.setInput('storageAccountName', 'teststorage');
tr.setInput('baseImageSource', 'default');
tr.setInput('baseImage', !!process.env["__ostype__"] ? 'MicrosoftWindowsServer:WindowsServer:2012-R2-Datacenter:' + process.env["__ostype__"] : 'MicrosoftWindowsServer:WindowsServer:2012-R2-Datacenter:windows');
tr.setInput('location', 'South India');
tr.setInput('packagePath', 'dir1\\**\\dir2');
tr.setInput('deployScriptPath', 'dir3\\**\\deploy.ps1');
tr.setInput('ConnectedServiceName', 'AzureRMSpn');
tr.setInput('skipPackerFix', 'true'); // This is the key difference - skip packer fix
if(!process.env["__no_output_vars__"] || process.env["__no_output_vars__"] !== "true") {
    tr.setInput('imageUri', 'imageUri');
    tr.setInput('imageStorageAccount', 'imageStorageAccount');
}
tr.setInput("additionalBuilderParameters", "{\"vm_size\":\"Standard_D3_v2\"}");
tr.setInput("skipTempFileCleanupDuringVMDeprovision", "true");

process.env["ENDPOINT_URL_AzureRMSpn"] = "https://management.azure.com/";
process.env["ENDPOINT_AUTH_SCHEME_AzureRMSpn"] = "ServicePrincipal";
process.env["ENDPOINT_AUTH_PARAMETER_AzureRMSpn_SERVICEPRINCIPALID"] = "spId";
process.env["ENDPOINT_AUTH_PARAMETER_AzureRMSpn_SERVICEPRINCIPALKEY"] = "spKey";
process.env["ENDPOINT_AUTH_PARAMETER_AzureRMSpn_TENANTID"] = "tenant";
process.env["ENDPOINT_DATA_AzureRMSpn_SUBSCRIPTIONNAME"] = "sName";
process.env["ENDPOINT_DATA_AzureRMSpn_SUBSCRIPTIONID"] =  "sId";
process.env["ENDPOINT_DATA_AzureRMSpn_ENVIRONMENTAUTHORITYURL"] = "https://login.windows.net/";
process.env["ENDPOINT_DATA_AzureRMSpn_ACTIVEDIRECTORYSERVICEENDPOINTRESOURCEID"] = "https://login.windows.net/";
process.env["ENDPOINT_DATA_AzureRMSpn_GRAPHURL"] = "https://graph.windows.net/";
process.env["RELEASE_RELEASENAME"] = "Release-1";
process.env["SYSTEM_DEFAULTWORKINGDIRECTORY"] =  DefaultWorkingDirectory;
process.env['AGENT_TEMPDIRECTORY'] = '.';

// provide answers for task mock
let a: any = <any>{
    "which": {
        "packer": "packer"
    },
    "checkPath": {
        "packer": process.env["__packer_exists__"] === "false" ? false : true,
        "basedir\\DefaultTemplates\\default.windows.template.json": process.env["__copy_fails__"] === "true" ? false : true,
        "C:\\deploy.ps1": true
    },
    "exec": {
        "packer --version": {
            "code": 0,
            "stdout": "Packer v1.4.0"
        },
        // Note: No packer fix command here since it should be skipped
        "packer validate -var-file=C:\\somefolder\\somevarfile.json -var-file=C:\\somefolder\\somevarfile.json F:\\somedir\\tempdir\\100\\default.windows.template.json": {
            "code": 0,
            "stdout": "Template validated successfully"
        },
        "packer build -force -color=false -var-file=C:\\somefolder\\somevarfile.json -var-file=C:\\somefolder\\somevarfile.json F:\\somedir\\tempdir\\100\\default.windows.template.json": {
            "code": 0,
            "stdout": "Build 'azure-arm' finished.\n==> Builds finished. The artifacts of successful builds are:\n--> azure-arm: Azure.ResourceManagement.VMImage:\n\nOSDiskUri: https://bishalpackerimages.blob.core.windows.net/system/Microsoft.Compute/Images/packer/packer-osDisk.e2e08a75-2d73-49ad-97c2-77f8070b65f5.vhd\nOSDiskUriReadOnlySas: https://bishalpackerimages.blob.core.windows.net/system/Microsoft.Compute/Images/packer/packer-osDisk.e2e08a75-2d73-49ad-97c2-77f8070b65f5.vhd?se=2017-04-01T01%3A36%3A49Z&sig=dfger34525345%3D&sp=r&sr=b&sv=2015-02-21\nTemplateUri: https://bishalpackerimages.blob.core.windows.net/system/Microsoft.Compute/Images/packer/packer-vmTemplate.e2e08a75-2d73-49ad-97c2-77f8070b65f5.json\nTemplateUriReadOnlySas: https://bishalpackerimages.blob.core.windows.net/system/Microsoft.Compute/Images/packer/packer-vmTemplate.e2e08a75-2d73-49ad-97c2-77f8070b65f5.json?se=2017-04-01T01%3A36%3A49Z&sig=dfger34525345%3D&sp=r&sr=b&sv=2015-02-21\nStorageAccountLocation: southindia"
        }
    },
    "exist": {
        "F:\\somedir\\tempdir\\100": process.env["__dest_path_exists__"] === "false" ? false : true,
        "basedir\\DefaultTemplates\\default.windows.template.json": process.env["__copy_fails__"] === "true" ? false : true,
        "C:\\a\\w\\dir1\\somedir\\dir2": true,
        "C:\\a\\w\\dir1\\somedir\\dir2\\dir3\\somedir\\deploy.ps1": true,
        "/tmp/tempdir/100": true
    },
    "find": {
        "dir1\\**\\dir2": ["C:\\a\\w\\dir1\\somedir\\dir2"],
        "dir3\\**\\deploy.ps1": ["C:\\a\\w\\dir1\\somedir\\dir2\\dir3\\somedir\\deploy.ps1"]
    },
    "rmRF": {
        "F:\\somedir\\tempdir\\100": {
            "success": true,
        }
    },
    "mkdirP": {
        "F:\\somedir\\tempdir\\100": {
            "success": true
        },
        "C:\\somefolder": {
            "success": true
        }
    },
    "cp": {
        "basedir\\DefaultTemplates\\default.windows.template.json": {
            "success": process.env["__copy_fails__"] === "true" ? false : true,
        }
    },
    "writeFile": {
        "F:\\somedir\\tempdir\\100\\default.windows.template.json": {
            "success": true
        },
        "C:\\somefolder\\somevarfile.json": {
            "success": true
        }
    },
    "readFile": {
        "basedir\\DefaultTemplates\\default.windows.template.json": "{\"variables\":{\"drop-location\":\"{{user `drop-location`}}\", \"subscription_id\":\"{{user `subscription_id`}}\", \"client_id\":\"{{user `client_id`}}\", \"client_secret\":\"{{user `client_secret`}}\", \"tenant_id\":\"{{user `tenant_id`}}\", \"resource_group\":\"{{user `resource_group`}}\", \"storage_account\":\"{{user `storage_account`}}\", \"capture_name_prefix\":\"{{user `capture_name_prefix`}}\", \"image_publisher\":\"{{user `image_publisher`}}\", \"image_offer\":\"{{user `image_offer`}}\", \"image_sku\":\"{{user `image_sku`}}\", \"location\":\"{{user `location`}}\"},\"builders\":[{\"type\":\"azure-arm\", \"subscription_id\":\"{{user `subscription_id`}}\", \"client_id\":\"{{user `client_id`}}\", \"client_secret\":\"{{user `client_secret`}}\", \"tenant_id\":\"{{user `tenant_id`}}\", \"resource_group_name\":\"{{user `resource_group`}}\", \"storage_account\":\"{{user `storage_account`}}\", \"capture_container_name\":\"packer\", \"capture_name_prefix\":\"{{user `capture_name_prefix`}}\", \"image_publisher\":\"{{user `image_publisher`}}\", \"image_offer\":\"{{user `image_offer`}}\", \"image_sku\":\"{{user `image_sku`}}\", \"location\":\"{{user `location`}}\", \"vm_size\":\"Standard_D3_v2\"}],\"provisioners\":[{\"type\":\"powershell\", \"elevated_user\":\"{{.WinRMUser}}\", \"elevated_password\":\"{{.WinRMPassword}}\", \"inline\":[\"mkdir {{user `drop-location`}}\"]}, {\"type\":\"file\", \"source\":\".\", \"destination\":\"{{user `drop-location`}}\"}, {\"type\":\"powershell\", \"elevated_user\":\"{{.WinRMUser}}\", \"elevated_password\":\"{{.WinRMPassword}}\", \"scripts\":[\"{{user `drop-location`}}\\\\{{user `script_relative_path`}}\"]}]}",
        "F:\\somedir\\tempdir\\100\\default.windows.template.json": "{\"variables\":{\"drop-location\":\"{{user `drop-location`}}\", \"subscription_id\":\"{{user `subscription_id`}}\", \"client_id\":\"{{user `client_id`}}\", \"client_secret\":\"{{user `client_secret`}}\", \"tenant_id\":\"{{user `tenant_id`}}\", \"resource_group\":\"{{user `resource_group`}}\", \"storage_account\":\"{{user `storage_account`}}\", \"capture_name_prefix\":\"{{user `capture_name_prefix`}}\", \"image_publisher\":\"{{user `image_publisher`}}\", \"image_offer\":\"{{user `image_offer`}}\", \"image_sku\":\"{{user `image_sku`}}\", \"location\":\"{{user `location`}}\"},\"builders\":[{\"type\":\"azure-arm\", \"subscription_id\":\"{{user `subscription_id`}}\", \"client_id\":\"{{user `client_id`}}\", \"client_secret\":\"{{user `client_secret`}}\", \"tenant_id\":\"{{user `tenant_id`}}\", \"resource_group_name\":\"{{user `resource_group`}}\", \"storage_account\":\"{{user `storage_account`}}\", \"capture_container_name\":\"packer\", \"capture_name_prefix\":\"{{user `capture_name_prefix`}}\", \"image_publisher\":\"{{user `image_publisher`}}\", \"image_offer\":\"{{user `image_offer`}}\", \"image_sku\":\"{{user `image_sku`}}\", \"location\":\"{{user `location`}}\", \"vm_size\":\"Standard_D3_v2\"}],\"provisioners\":[{\"type\":\"powershell\", \"elevated_user\":\"{{.WinRMUser}}\", \"elevated_password\":\"{{.WinRMPassword}}\", \"inline\":[\"mkdir {{user `drop-location`}}\"]}, {\"type\":\"file\", \"source\":\".\", \"destination\":\"{{user `drop-location`}}\"}, {\"type\":\"powershell\", \"elevated_user\":\"{{.WinRMUser}}\", \"elevated_password\":\"{{.WinRMPassword}}\", \"scripts\":[\"{{user `drop-location`}}\\\\{{user `script_relative_path`}}\"]}]}"
    }
};
tr.setAnswers(a);

tr.run();