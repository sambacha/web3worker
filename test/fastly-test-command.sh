# fastly test

# requires: https://github.com/rcoh/angle-grinder
while true; do bash -c 'echo hello | openssl s_client -connect www.gov.uk:443 -tls1_2 -tlsextdebug -status -servername www.gov.uk 2>&1 | grep -q "OCSP Response Status: successful" ; echo $?'; sleep 0.5; done | agrind '* | parse "*" as code | count by code'

# Is OCSP stapling used?
# code        _count
# --------------------------
# 0 (yes)          201