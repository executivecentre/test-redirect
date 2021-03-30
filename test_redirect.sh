#!/bin/bash
strings=(
    "https://www.executivecentre.com/contact_us https://www.executivecentre.com/contact-us/"
    "https://www.executivecentre.com/bespoke/ /enterprise-solutions-serviced-office/"
    "https://www.executivecentre.com/remote-workspace/ https://www.executivecentre.com/virtual-office/"
    "https://www.executivecentre.com/blog-article/celebrating-one-year-of-tec-community-2/ /blog-article/celebrating-one-year-of-tec-community/"
    "https://www.executivecentre.com/blog-article/tec-blog/ /blog-article/global-member-network-the-future-of-work/"

#   "https://www.executivecentre.com/city/* https://www.executivecentre.com/locations/*"
    "https://www.executivecentre.com/city/hong-kong https://www.executivecentre.com/locations/hong-kong/"
    "https://www.executivecentre.com/city/sydney https://www.executivecentre.com/locations/sydney/"
    "https://www.executivecentre.com/city/australia https://www.executivecentre.com/locations/?market=australia"
#   "https://www.executivecentre.com/news/* https://www.executivecentre.com/press-and-media/"
    "https://www.executivecentre.com/news/the-executive-centre-expanding-in-china-market/ https://www.executivecentre.com/press-and-media/"
    "https://www.executivecentre.com/news/enterprise-solutions-by-the-executive-centre-new-video-series-announces-landmark-product-evolution/ https://www.executivecentre.com/press-and-media/"
#   "https://www.executivecentre.com/conference_centre/* https://www.executivecentre.com/meeting-rooms-conference/"
    "https://www.executivecentre.com/conference_centre/54d-eagle-street https://www.executivecentre.com/meeting-rooms-conference/"
#   "https://www.executivecentre.com/serviced_offices/* https://www.executivecentre.com/private-workspace/"
    "https://www.executivecentre.com/serviced_offices/hong-kong https://www.executivecentre.com/private-workspace/"
#   "https://www.executivecentre.com/centre-page/* https://www.executivecentre.com/office-space/*"
    "https://www.executivecentre.com/centre-page/hk-central-nexxus-building https://www.executivecentre.com/office-space/hk-central-nexxus-building/"
#   "/shared_offices/* https://www.executivecentre.com/"
    "https://www.executivecentre.com/shared_offices/virtual_offices/ https://www.executivecentre.com/virtual-office/"
    "https://www.executivecentre.com/shared_offices/call_handling/ https://www.executivecentre.com/virtual-office/"
    "https://www.executivecentre.com/shared_offices/whatever/ https://www.executivecentre.com/"

#   "https://www.executivecentre.com/id-id/* https://www.executivecentre.com/en-id/*"
    "https://www.executivecentre.com/id-id/ https://www.executivecentre.com/en-id/"
    "https://www.executivecentre.com/id-id/coworking/ https://www.executivecentre.com/en-id/coworking/"


    "https://www.executivecentre.com/about/terms_and_conditions https://www.executivecentre.com/terms-and-conditions/"
    "https://www.executivecentre.com/about/privacy_policy https://www.executivecentre.com/privacy-policy/"
    "https://www.executivecentre.com/serviced_offices https://www.executivecentre.com/private-workspace/"
    "https://www.executivecentre.com/conference_centre https://www.executivecentre.com/meeting-rooms-conference/"
    "https://www.executivecentre.com/news/ https://www.executivecentre.com/press-and-media/"
    "https://www.executivecentre.com/chauffeur https://www.executivecentre.com/2017/02/10/tbr/"
    "https://www.executivecentre.com/company_formation https://www.executivecentre.com/about-us/"
    "https://www.executivecentre.com/office-space/hk-quarry-bay-one-island-east-lv60/ /office-space/hk-quarry-bay-one-island-east/"
    "https://www.executivecentre.com/meeting-room/60a-one-island-east-l60/ /office-space/hk-quarry-bay-one-island-east/"
    "https://www.executivecentre.com/meeting-room/60b-one-island-east-l60/ /office-space/hk-quarry-bay-one-island-east/"
    "https://www.executivecentre.com/virtual_offices/ https://www.executivecentre.com/virtual-office/"
    "https://www.executivecentre.com/campaign https://www.executivecentre.com/"
    "https://www.executivecentre.com/en-au/sydney-coworking-spaces/ https://www.executivecentre.com/en-au/locations/sydney/coworking-spaces-in-sydney/ "
    "https://www.executivecentre.com/en-au/sydney-meeting-rooms-conference-centres/ https://www.executivecentre.com/en-au/locations/sydney/meeting-conference-rooms-in-sydney/"
    "https://www.executivecentre.com/en-au/sydney-serviced-offices/ https://www.executivecentre.com/en-au/locations/sydney/serviced-offices-in-sydney/"
    "https://www.executivecentre.com/en-au/sydney-virtual-offices/ https://www.executivecentre.com/en-au/locations/sydney/virtual-offices-in-sydney/"
    "https://www.executivecentre.com/en-au/perth-coworking-spaces/  https://www.executivecentre.com/en-au/locations/perth/coworking-spaces-in-perth/ "
    "https://www.executivecentre.com/en-au/perth-meeting-rooms-conference-centres/ https://www.executivecentre.com/en-au/locations/perth/meeting-conference-rooms-in-perth/"
    "https://www.executivecentre.com/en-au/perth-serviced-offices/ https://www.executivecentre.com/en-au/locations/perth/serviced-offices-in-perth/"
    "https://www.executivecentre.com/en-au/perth-virtual-offices/ https://www.executivecentre.com/en-au/locations/perth/virtual-offices-in-perth/"
    "https://www.executivecentre.com/en-au/melbourne-coworking-spaces/  https://www.executivecentre.com/en-au/locations/melbourne/coworking-spaces-in-melbourne/ "
    "https://www.executivecentre.com/en-au/melbourne-meeting-rooms-conference-centres/ https://www.executivecentre.com/en-au/locations/melbourne/meeting-conference-rooms-in-melbourne/"
    "https://www.executivecentre.com/en-au/melbourne-serviced-offices/ https://www.executivecentre.com/en-au/locations/melbourne/serviced-offices-in-melbourne/"
    "https://www.executivecentre.com/en-au/melbourne-virtual-offices/ https://www.executivecentre.com/en-au/locations/melbourne/virtual-offices-in-melbourne/"
    "https://www.executivecentre.com/en-au/brisbane-coworking-spaces/  https://www.executivecentre.com/en-au/locations/brisbane/coworking-spaces-in-brisbane/ "
    "https://www.executivecentre.com/en-au/brisbane-meeting-rooms-conference-centres/ https://www.executivecentre.com/en-au/locations/brisbane/meeting-conference-rooms-in-brisbane/"
    "https://www.executivecentre.com/en-au/brisbane-serviced-offices/ https://www.executivecentre.com/en-au/locations/brisbane/serviced-offices-in-brisbane/"
    "https://www.executivecentre.com/en-au/brisbane-virtual-offices/ https://www.executivecentre.com/en-au/locations/brisbane/virtual-offices-in-brisbane/"
    "https://www.executivecentre.com/?page_id=4679 https://www.executivecentre.com/"
    "https://www.executivecentre.com/?page_id=4712 https://www.executivecentre.com/"
    "https://www.executivecentre.com/?page_id=528 https://www.executivecentre.com/"
    "https://www.executivecentre.com/?page_id=4521 https://www.executivecentre.com/"
    "https://www.executivecentre.com/?page_id=4510 https://www.executivecentre.com/"
    "https://www.executivecentre.com/?page_id=4518 https://www.executivecentre.com/"
    "https://www.executivecentre.com/contact_us https://www.executivecentre.com/contact-us/"
    "https://www.executivecentre.com?contact-us https://www.executivecentre.com/contact-us/?contact-us"
    "https://www.executivecentre.com/?contact-us https://www.executivecentre.com/contact-us/?contact-us"
    "https://www.executivecentre.com/corporate-responsibility https://www.executivecentre.com/"
    "https://www.executivecentre.com/private-offices https://www.executivecentre.com/private-workspace/"
    "https://www.executivecentre.com/shared_offices https://www.executivecentre.com/"
    "https://www.executivecentre.com/business-services/ https://www.executivecentre.com/"
    "https://www.executivecentre.com/shared-workspaces/ https://www.executivecentre.com/"
    "https://www.executivecentre.com/exclusive-workspaces/ https://www.executivecentre.com/"
    "https://www.executivecentre.com/meetings-events/ https://www.executivecentre.com/meeting-rooms-conference/"
    "https://www.executivecentre.com/event-venues-event-management/ https://www.executivecentre.com/event-space-venue/"
    "https://www.executivecentre.com/event-venues-management-services/ https://www.executivecentre.com/event-space-venue/"
    "https://www.executivecentre.com/locations/australia/ https://www.executivecentre.com/locations/?market=australia"
    "https://www.executivecentre.com/locations/china/ https://www.executivecentre.com/locations/?market=china"
    "https://www.executivecentre.com/locations/india/ https://www.executivecentre.com/locations/?market=india"
    "https://www.executivecentre.com/locations/indonesia/ https://www.executivecentre.com/locations/?market=indonesia"
    "https://www.executivecentre.com/locations/japan/ https://www.executivecentre.com/locations/?market=japan"
    "https://www.executivecentre.com/locations/philippines/ https://www.executivecentre.com/locations/?market=philippines"
    "https://www.executivecentre.com/locations/singapore/ https://www.executivecentre.com/locations/?market=singapore"
    "https://www.executivecentre.com/locations/south-korea/ https://www.executivecentre.com/locations/?market=south-korea"
    "https://www.executivecentre.com/locations/sri-lanka/ https://www.executivecentre.com/locations/?market=sri-lanka"
    "https://www.executivecentre.com/locations/uae/ https://www.executivecentre.com/locations/?market=uae"
    "https://www.executivecentre.com/locations/vietnam/ https://www.executivecentre.com/locations/?market=vietnam"
    "https://www.executivecentre.com/sitemap_index.xml https://www.executivecentre.com/sitemap.xml"
    "https://www.executivecentre.com/apple-app-site-association "
    "https://www.executivecentre.com/baidu_verify_IWxiPsHGxC.html "
    "https://www.executivecentre.com/words_with_many_hyphens https://www.executivecentre.com/words-with-many-hyphens/"
)


now=$(date +"%Y_%m_%dT%H_%M_%S")
filename="output/redirect_result_$now.txt"
echo "./$filename"
echo "Test 301 redirects $now" | tee "$filename"
echo  | tee -a "$filename"

count_success=0
echo "Testing ${#strings[@]} cases" | tee -a "$filename"
for i in "${!strings[@]}"; do
    stringArray=(${strings[$i]})

    echo "# $i. ${stringArray[0]} -> ${stringArray[1]}"
    echo "# $i. ${stringArray[0]}" >> "$filename"
    addr=$(curl -sL -D - "${stringArray[0]}" -o /dev/null | grep -i location: | sed -r -e 's/location: (.+)$/\1/i' )
    expect=${stringArray[1]}
    echo "Location:" >> "$filename"
    echo "$addr" >> "$filename"
    echo "Expect:" >> "$filename"
    echo "$expect" >> "$filename"

    if [[ "$expect" == "${addr##*$'\n'}" ]]; then
        ((count_success=count_success+1))
        echo OK | tee -a "$filename"
    else
        echo Failed | tee -a "$filename"
    fi

    echo >> "$filename"
    echo >> "$filename"
done


echo "Passed: $count_success / ${#strings[@]}" | tee -a "$filename"
echo "See results here: ./$filename"
