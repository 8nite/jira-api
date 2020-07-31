import express from 'express'
import rp from 'request'
import queryString from 'query-string'
import ActiveDirectory from 'activedirectory2'
require('dotenv').config()

const router = express.Router();

router.get('/', (req, res) => {
  rp
    .get('https://' + process.env.JIRAUSER + ':' + process.env.JIRAPASS + '@jirasd-uat.hgc.com.hk/secure/attachment/12701/jira_integration__ht__2020-06-10_11.12am.png')
    .on('response', function (response) {
      console.log(response.statusCode)
      console.log(response.headers['content-type'])
    })
    .pipe(res)
})

router.get('/ad', (req, res) => {
  const attributes = [
    'accountExpires',
    'badPasswordTime',
    'badPwdCount',
    'cn',
    'codePage',
    'company',
    'countryCode',
    'department',
    'description',
    'displayName',
    'distinguishedName',
    'dSCorePropagationData',
    'givenName',
    'homeMDB',
    'instanceType',
    'lastLogoff',
    'lastLogon',
    'lastLogonTimestamp',
    'legacyExchangeDN',
    'lockoutTime',
    'logonCount',
    'mail',
    'mailNickname',
    'mDBUseDefaults',
    'memberOf',
    'msExchArchiveQuota',
    'msExchArchiveWarnQuota',
    'msExchCalendarLoggingQuota',
    'msExchDumpsterQuota',
    'msExchDumpsterWarningQuota',
    'msExchELCMailboxFlags',
    'msExchHomeServerName',
    'msExchMailboxGuid',
    'msExchMailboxSecurityDescriptor',
    'msExchPoliciesIncluded',
    'msExchRBACPolicyLink',
    'msExchRecipientDisplayType',
    'msExchRecipientTypeDetails',
    'msExchTextMessagingState',
    'msExchUMDtmfMap',
    'msExchUserAccountControl',
    'msExchVersion',
    'msExchWhenMailboxCreated',
    'name',
    'nTSecurityDescriptor',
    'objectCategory',
    'objectClass',
    'objectGUID',
    'objectSid',
    'physicalDeliveryOfficeName',
    'primaryGroupID',
    'proxyAddresses',
    'pwdLastSet',
    'sAMAccountName',
    'sAMAccountType',
    'scriptPath',
    'showInAddressBook',
    'sn',
    'title',
    'userAccountControl',
    'userPrincipalName',
    'uSNChanged',
    'uSNCreated',
    'whenChanged',
    'whenCreated',
    'telephoneNumber'
  ]

  const group = [

  ]

  const config = {
    url: 'ldap://egpvmadcap01.office.hgc.com.hk',
    baseDN: 'OU=HGC,DC=office,DC=hgc,DC=com,DC=hk',
    username: 'herbtung@office.hgc.com.hk',
    password: 'P@ssw0rdApr00',
    attributes: { user: attributes }
  }

  const ad = new ActiveDirectory(config);

  const sAMAccountName = 'rynerltf';

  ad.authenticate(config.username, config.password, function (err, auth) {
    if (err) {
      console.log('ERROR: ' + JSON.stringify(err));
      return;
    }

    if (auth) {
      console.log('Authenticated!');
    }
    else {
      console.log('Authentication failed!');
    }
  });

  ad.findUser(sAMAccountName, function (err, user) {
    if (err) {
      console.log('ERROR: ' + JSON.stringify(err));
      return;
    }

    if (!user) console.log('User: ' + sAMAccountName + ' not found.');
    else {
      console.log(JSON.stringify(user));
      res.json(user)
    }
  });
})

module.exports = router;