//Maya ASCII 2022 scene
//Name: Apron_rig_01.ma
//Last modified: Sat, Apr 23, 2022 10:27:15 PM
//Codeset: 1252
file -rdi 1 -ns "MauriceRig_v01" -dr 1 -rfn "MauriceRig_v01RN" -op "VERS|2022|UVER|undef|MADE|undef|CHNG|Mon, Mar 28, 2022 11:38:39 PM|ICON|undef|INFO|undef|OBJN|784|INCL|undef(|LUNI|cm|TUNI|film|AUNI|deg|TDUR|141120000|"
		 -typ "mayaBinary" "P:/Dropbox/$Gumroad_Store/RIGS/BOUNCYRACOON/scenes/MauriceRig_v01.mb";
file -r -ns "MauriceRig_v01" -dr 1 -rfn "MauriceRig_v01RN" -op "VERS|2022|UVER|undef|MADE|undef|CHNG|Mon, Mar 28, 2022 11:38:39 PM|ICON|undef|INFO|undef|OBJN|784|INCL|undef(|LUNI|cm|TUNI|film|AUNI|deg|TDUR|141120000|"
		 -typ "mayaBinary" "P:/Dropbox/$Gumroad_Store/RIGS/BOUNCYRACOON/scenes/MauriceRig_v01.mb";
requires maya "2022";
requires "stereoCamera" "10.0";
requires -nodeType "aiOptions" -nodeType "aiAOVDriver" -nodeType "aiAOVFilter" "mtoa" "5.0.0.1";
currentUnit -l centimeter -a degree -t film;
fileInfo "application" "maya";
fileInfo "product" "Maya 2022";
fileInfo "version" "2022";
fileInfo "cutIdentifier" "202110272215-ad32f8f1e6";
fileInfo "osv" "Windows 10 Home v2009 (Build: 19043)";
fileInfo "UUID" "14309B46-4932-D4E9-4843-2AA09CE2CB9E";
createNode transform -s -n "persp";
	rename -uid "2F332156-47B8-9B2A-27CA-B48790C38007";
	setAttr ".v" no;
	setAttr ".t" -type "double3" -2.4025148412164659 27.385537788451707 48.317894271459693 ;
	setAttr ".r" -type "double3" -11.138352729545504 1434.199999999659 0 ;
createNode camera -s -n "perspShape" -p "persp";
	rename -uid "8AE41112-4918-04C6-3D4A-9F9DE6E284F0";
	setAttr -k off ".v" no;
	setAttr ".fl" 34.999999999999993;
	setAttr ".coi" 52.252568285912758;
	setAttr ".imn" -type "string" "persp";
	setAttr ".den" -type "string" "persp_depth";
	setAttr ".man" -type "string" "persp_mask";
	setAttr ".tp" -type "double3" 0 21.494277954101562 -1.3322676295501878e-15 ;
	setAttr ".hc" -type "string" "viewSet -p %camera";
	setAttr ".ai_translator" -type "string" "perspective";
createNode transform -s -n "top";
	rename -uid "95599B7B-4701-12D1-7E2A-42A9AF5787E1";
	setAttr ".v" no;
	setAttr ".t" -type "double3" 0 1000.1 0 ;
	setAttr ".r" -type "double3" -90 0 0 ;
createNode camera -s -n "topShape" -p "top";
	rename -uid "E251A91F-43E5-3CEC-D3C8-2C8951903580";
	setAttr -k off ".v" no;
	setAttr ".rnd" no;
	setAttr ".coi" 1000.1;
	setAttr ".ow" 30;
	setAttr ".imn" -type "string" "top";
	setAttr ".den" -type "string" "top_depth";
	setAttr ".man" -type "string" "top_mask";
	setAttr ".hc" -type "string" "viewSet -t %camera";
	setAttr ".o" yes;
	setAttr ".ai_translator" -type "string" "orthographic";
createNode transform -s -n "front";
	rename -uid "12A6FED8-4B7E-A9BD-861A-A5A2A4746F36";
	setAttr ".v" no;
	setAttr ".t" -type "double3" 2.7164617210766924 17.625947512398234 1000.1536781862025 ;
createNode camera -s -n "frontShape" -p "front";
	rename -uid "A4598495-4015-C976-08C6-B78A489D609F";
	setAttr -k off ".v" no;
	setAttr ".rnd" no;
	setAttr ".coi" 995.71679327175627;
	setAttr ".ow" 31.230751321567976;
	setAttr ".imn" -type "string" "front";
	setAttr ".den" -type "string" "front_depth";
	setAttr ".man" -type "string" "front_mask";
	setAttr ".tp" -type "double3" -3.6603341208873799 9.6693130906023388 4.4368849144462246 ;
	setAttr ".hc" -type "string" "viewSet -f %camera";
	setAttr ".o" yes;
	setAttr ".ai_translator" -type "string" "orthographic";
createNode transform -s -n "side";
	rename -uid "BBA625BD-4279-B915-4981-C6A71AB5A5D4";
	setAttr ".v" no;
	setAttr ".t" -type "double3" 1000.1675449626258 17.944486440239984 3.7170778826419664 ;
	setAttr ".r" -type "double3" 0 90 0 ;
createNode camera -s -n "sideShape" -p "side";
	rename -uid "41AA24A6-4554-CD36-2A1C-CA961B5555BB";
	setAttr -k off ".v" no;
	setAttr ".rnd" no;
	setAttr ".coi" 1000.1675449626258;
	setAttr ".ow" 41.107018443114448;
	setAttr ".imn" -type "string" "side";
	setAttr ".den" -type "string" "side_depth";
	setAttr ".man" -type "string" "side_mask";
	setAttr ".tp" -type "double3" 0 14.393242359161377 4.2831182479858398 ;
	setAttr ".hc" -type "string" "viewSet -s %camera";
	setAttr ".o" yes;
	setAttr ".ai_translator" -type "string" "orthographic";
createNode transform -n "apron_rig";
	rename -uid "3F4B7C8E-4E21-8779-2286-E2ACC89875ED";
	setAttr ".t" -type "double3" 0 0 -4.3639740943908691 ;
	setAttr ".rp" -type "double3" 0 14.025846641441378 4.3639740943908691 ;
	setAttr ".sp" -type "double3" 0 14.025846641441378 4.3639740943908691 ;
createNode transform -n "rig" -p "apron_rig";
	rename -uid "D1A95A45-4F32-6EA9-60DA-C89105CFCC57";
	setAttr ".t" -type "double3" 0 0 4.3639740943908691 ;
createNode joint -n "Apron_03" -p "rig";
	rename -uid "E0058C61-4196-7E51-7DF8-2EBB4D410B87";
	addAttr -ci true -sn "liw" -ln "lockInfluenceWeights" -min 0 -max 1 -at "bool";
	setAttr ".v" no;
	setAttr ".uoc" 1;
	setAttr ".mnrl" -type "double3" -360 -360 -360 ;
	setAttr ".mxrl" -type "double3" 360 360 360 ;
	setAttr ".jo" -type "double3" -90.000000000000043 0.56726640985841348 -90 ;
	setAttr ".bps" -type "matrix" 0 -0.9999509888009116 -0.0099005048396213491 0 -4.4408920985006262e-16 0.0099005048396212381 -0.9999509888009116 0
		 1 0 -4.4408920985006262e-16 0 5.9164567891575885e-31 13.245091962048427 -1.8463651141331638e-07 1;
	setAttr ".radi" 0.61724459526271147;
	setAttr ".liw" yes;
createNode joint -n "Apron_04" -p "Apron_03";
	rename -uid "F2DFE66D-4FAB-C4F6-2548-EC870B73B543";
	addAttr -ci true -sn "liw" -ln "lockInfluenceWeights" -min 0 -max 1 -at "bool";
	setAttr ".uoc" 1;
	setAttr ".oc" 1;
	setAttr ".mnrl" -type "double3" -360 -360 -360 ;
	setAttr ".mxrl" -type "double3" 360 360 360 ;
	setAttr ".jo" -type "double3" 6.2831968636697886e-17 -1.2692368706342355e-14 -0.56726640985783017 ;
	setAttr ".bps" -type "matrix" 4.3967073713396445e-18 -1 -1.0181092080507881e-14 0
		 -4.4406744450538564e-16 1.0070069778045365e-14 -1 0 1 0 -4.4408920985006262e-16 0
		 7.3098559311325256e-16 10.115605354309082 -0.032342449343917494 1;
	setAttr ".radi" 0.60385330781666513;
	setAttr ".liw" yes;
createNode joint -n "Apron_05" -p "Apron_04";
	rename -uid "18D28158-4BD0-8651-F6FF-64BE65E5A714";
	addAttr -ci true -sn "liw" -ln "lockInfluenceWeights" -min 0 -max 1 -at "bool";
	setAttr ".uoc" 1;
	setAttr ".oc" 2;
	setAttr ".mnrl" -type "double3" -360 -360 -360 ;
	setAttr ".mxrl" -type "double3" 360 360 360 ;
	setAttr ".bps" -type "matrix" 4.3967073713396445e-18 -1 -1.0181092080507881e-14 0
		 -4.4406744450538564e-16 1.0070069778045365e-14 -1 0 1 0 -4.4408920985006262e-16 0
		 1.4105156824004129e-15 7.1077747365202235 -0.032342449343917716 1;
	setAttr ".radi" 0.5;
	setAttr ".liw" yes;
createNode joint -n "Apron_06" -p "Apron_05";
	rename -uid "0B64FABA-4327-5112-E688-55884876DC40";
	addAttr -ci true -sn "liw" -ln "lockInfluenceWeights" -min 0 -max 1 -at "bool";
	setAttr ".uoc" 1;
	setAttr ".oc" 3;
	setAttr ".t" -type "double3" 1.0108324850546166 -9.540979117872439e-15 1.8753699034622123e-16 ;
	setAttr ".r" -type "double3" 3.1805546814635168e-15 3.1805546814635176e-15 -9.5416640443905519e-15 ;
	setAttr ".mnrl" -type "double3" -360 -360 -360 ;
	setAttr ".mxrl" -type "double3" 360 360 360 ;
	setAttr ".jo" -type "double3" 89.999999999999417 -89.999999999999986 0 ;
	setAttr ".bps" -type "matrix" 1 -3.330669073875481e-16 -3.3306690738755036e-16 0
		 2.7315904878494487e-16 0.99999999999999978 -1.4398204850607669e-16 0 4.4406744450538555e-16 1.9949319973733124e-16 1 0
		 1.6024970073848676e-15 6.0969422514656069 -0.032342449343918465 1;
	setAttr ".radi" 0.5;
createNode parentConstraint -n "Apron_05_parentConstraint1" -p "Apron_05";
	rename -uid "41C62DB8-4843-7FA4-59B5-CB8A24458D7F";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_05_offsetW0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr ".tg[0].tot" -type "double3" 1.4105156824004125e-15 2.0231523123470652e-09 
		-0.032342449343917175 ;
	setAttr ".tg[0].tor" -type "double3" -90 5.8522206138928706e-13 -89.999999999999972 ;
	setAttr ".lr" -type "double3" 0 0 -5.8522206138928706e-13 ;
	setAttr ".rst" -type "double3" 3.0078306177888585 -3.0399294193017568e-14 6.6630553823817362e-16 ;
	setAttr ".rsrr" -type "double3" 0 0 -5.8522206138928706e-13 ;
	setAttr -k on ".w0";
createNode scaleConstraint -n "Apron_05_scaleConstraint1" -p "Apron_05";
	rename -uid "82F574E5-4E48-7EC7-9F75-509A0E5A6911";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_05_offsetW0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr -k on ".w0";
createNode parentConstraint -n "Apron_04_parentConstraint1" -p "Apron_04";
	rename -uid "399A895D-46DD-03E6-8557-BC8897B054A6";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_04W0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr ".tg[0].tot" -type "double3" 7.3098559311325187e-16 0 -0.032342449343917501 ;
	setAttr ".tg[0].tor" -type "double3" -90 5.8969471641009515e-13 -89.999999999999972 ;
	setAttr ".lr" -type "double3" 0 0 -5.8850200840454631e-13 ;
	setAttr ".rst" -type "double3" 3.1296534325964274 0.0013571822687779567 7.3158830311461606e-16 ;
	setAttr ".rsrr" -type "double3" 0 0 -5.8850200840454631e-13 ;
	setAttr -k on ".w0";
createNode scaleConstraint -n "Apron_04_scaleConstraint1" -p "Apron_04";
	rename -uid "6B863EB9-4D7B-C723-0E68-F5B34A711F42";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_04W0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr -k on ".w0";
createNode joint -n "Apron_02" -p "Apron_03";
	rename -uid "779C5DDA-4E62-1E33-DB6F-9BBF8FA7A8CC";
	addAttr -ci true -sn "liw" -ln "lockInfluenceWeights" -min 0 -max 1 -at "bool";
	setAttr ".uoc" 1;
	setAttr ".oc" 1;
	setAttr ".mnrl" -type "double3" -360 -360 -360 ;
	setAttr ".mxrl" -type "double3" 360 360 360 ;
	setAttr ".jo" -type "double3" -180 2.5840496707839087e-14 -0.89280710851801359 ;
	setAttr ".bps" -type "matrix" 6.9197061577550853e-18 -0.99998385886188734 0.0056817264708114452 0
		 3.2157061594804101e-16 0.0056817264708115562 0.99998385886188745 0 -1 -6.9581081361101622e-19 3.2162650665463969e-16 0
		 -5.6776752190358004e-16 18.937330550552076 -0.032342449343917425 1;
	setAttr ".radi" 0.74270674840668627;
	setAttr ".liw" yes;
createNode joint -n "Apron_01" -p "Apron_02";
	rename -uid "FDBF3B7D-4B75-1C86-B8D1-BF968B5DAE77";
	addAttr -ci true -sn "liw" -ln "lockInfluenceWeights" -min 0 -max 1 -at "bool";
	setAttr ".uoc" 1;
	setAttr ".oc" 2;
	setAttr ".mnrl" -type "double3" -360 -360 -360 ;
	setAttr ".mxrl" -type "double3" 360 360 360 ;
	setAttr ".jo" -type "double3" 179.99999999999997 -7.3443105334147119e-14 -0.68334957642047089 ;
	setAttr ".bps" -type "matrix" 3.0840286561280719e-18 -0.999980500406775 -0.006244902418457543 0
		 -8.8818416219225511e-16 0.0062449024184574294 -0.99998050040677522 0 1 4.2338845699896679e-18 -8.8816934884904722e-16 0
		 -1.9923448202705086e-15 21.494278290217029 -0.016374248847199312 1;
	setAttr ".radi" 0.58053435862472591;
createNode joint -n "Apron_07" -p "Apron_01";
	rename -uid "B5076D21-4A30-4DFC-06E3-41BC39C96655";
	addAttr -ci true -sn "liw" -ln "lockInfluenceWeights" -min 0 -max 1 -at "bool";
	setAttr ".uoc" 1;
	setAttr ".oc" 3;
	setAttr ".t" -type "double3" -0.74576527765980671 0.0870873132134172 7.3415527653087012e-16 ;
	setAttr ".mnrl" -type "double3" -360 -360 -360 ;
	setAttr ".mxrl" -type "double3" 360 360 360 ;
	setAttr ".jo" -type "double3" 89.642191122239126 -89.999999999999943 0 ;
	setAttr ".bps" -type "matrix" 1 -8.8358055428966473e-16 -9.4922600519664367e-16 0
		 8.2403667652753348e-16 1 -3.4694469519543537e-18 0 9.9916988596688575e-16 5.9847959921199845e-17 1.0000000000000002 0
		 -1.33783907755072e-15 22.240572877530184 -0.098802632507374422 1;
	setAttr ".radi" 0.5;
	setAttr ".liw" yes;
createNode parentConstraint -n "Apron_01_parentConstraint1" -p "Apron_01";
	rename -uid "BD8793F6-4076-EA9D-A58A-679F55AE9042";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_03W0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr ".tg[0].tot" -type "double3" -1.9923448202705093e-15 3.361154696790436e-07 
		-0.016374248847197573 ;
	setAttr ".tg[0].tor" -type "double3" -90.000000000000057 0.35780887776087084 -89.999999999999986 ;
	setAttr ".lr" -type "double3" -1.2065827054556334e-14 2.6553307796256539e-16 1.5405811738338899e-14 ;
	setAttr ".rst" -type "double3" -2.5568157406708849 0.030495820408724325 1.4166914444946374e-15 ;
	setAttr ".rsrr" -type "double3" 6.5616546110062169e-16 1.8966648425897742e-16 -3.975693351829395e-16 ;
	setAttr -k on ".w0";
createNode scaleConstraint -n "Apron_01_scaleConstraint1" -p "Apron_01";
	rename -uid "540BE8BD-4E9B-3856-A8ED-EEA89EF60BC8";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_03W0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr -k on ".w0";
createNode parentConstraint -n "Apron_02_parentConstraint1" -p "Apron_02";
	rename -uid "D58664AC-4220-CB47-0200-68B82F1FEF7E";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_02W0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr ".tg[0].tot" -type "double3" -5.6776752190358063e-16 3.0458039645964163e-07 
		-0.032342449343916516 ;
	setAttr ".tg[0].tor" -type "double3" 90.000000000000014 -0.32554069865959384 -89.999999999999972 ;
	setAttr ".lr" -type "double3" 5.7051232909682827e-15 -9.9120498017175576e-17 -1.6499127410091988e-14 ;
	setAttr ".rst" -type "double3" -5.6916394003166673 0.088696715267991222 -5.2837826770392245e-16 ;
	setAttr ".rsrr" -type "double3" 5.7051232909682827e-15 -9.9120498017175576e-17 -1.6499127410091988e-14 ;
	setAttr -k on ".w0";
createNode scaleConstraint -n "Apron_02_scaleConstraint1" -p "Apron_02";
	rename -uid "EB102F27-4363-8D2B-0C12-7A88162E3F1B";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_02W0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr -k on ".w0";
createNode joint -n "Aproncollar_R" -p "Apron_02";
	rename -uid "145AE402-4B3F-EAFE-7412-1D9784581627";
	addAttr -ci true -sn "liw" -ln "lockInfluenceWeights" -min 0 -max 1 -at "bool";
	setAttr ".uoc" 1;
	setAttr ".oc" 2;
	setAttr ".mnrl" -type "double3" -360 -360 -360 ;
	setAttr ".mxrl" -type "double3" 360 360 360 ;
	setAttr ".jo" -type "double3" -89.674459301340406 89.999999999999986 0 ;
	setAttr ".bps" -type "matrix" 1 -3.3268111967235891e-16 -3.7524436680848356e-16 0
		 2.7246323797133394e-16 1 -8.6736173798849291e-19 0 3.2160474130996277e-16 1.6913553890773869e-16 1.0000000000000002 0
		 -1.6071605282999111 18.987450263158131 -6.9388939039072284e-18 1;
	setAttr ".radi" 0.5;
	setAttr ".liw" yes;
createNode parentConstraint -n "Aproncollar_R_parentConstraint1" -p "Aproncollar_R";
	rename -uid "39126443-4E2F-6CC7-D9BB-068964D576E4";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_r_collarW0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr ".tg[0].tot" -type "double3" 0.00050650440220856296 0.0097452613270760935 
		-0.072910785675048856 ;
	setAttr ".tg[0].tor" -type "double3" -4.9696166897866593e-17 0 0 ;
	setAttr ".lr" -type "double3" 6.3611093629270335e-15 6.3611093629270335e-15 6.3611093629270335e-15 ;
	setAttr ".rst" -type "double3" -0.049935142666281962 0.032626693797798409 1.6071605282999104 ;
	setAttr -k on ".w0";
createNode scaleConstraint -n "Aproncollar_R_scaleConstraint1" -p "Aproncollar_R";
	rename -uid "DF55AEB8-4F61-27A8-E485-9085C94A2B1E";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_r_collarW0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr -k on ".w0";
createNode joint -n "Aproncollar_L" -p "Apron_02";
	rename -uid "BD400F1E-4624-F098-C3E5-0DBB21B77B9F";
	addAttr -ci true -sn "liw" -ln "lockInfluenceWeights" -min 0 -max 1 -at "bool";
	setAttr ".uoc" 1;
	setAttr ".oc" 2;
	setAttr ".mnrl" -type "double3" -360 -360 -360 ;
	setAttr ".mxrl" -type "double3" 360 360 360 ;
	setAttr ".jo" -type "double3" -89.674459301340406 89.999999999999986 0 ;
	setAttr ".bps" -type "matrix" 1 -3.3268111967235891e-16 -3.7524436680848356e-16 0
		 2.7246323797133394e-16 1 -8.6736173798849291e-19 0 3.2160474130996277e-16 1.6913553890773869e-16 1.0000000000000002 0
		 1.6229485642588892 18.967071025981095 4.163336342344337e-17 1;
	setAttr ".radi" 0.5;
	setAttr ".liw" yes;
createNode parentConstraint -n "Aproncollar_L_parentConstraint1" -p "Aproncollar_L";
	rename -uid "0D00E168-489E-1BD7-869D-658C9A622CD0";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_l_collarW0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr ".tg[0].tot" -type "double3" -0.015281531556770034 -0.010633975849955846 
		-0.072910785675048828 ;
	setAttr ".tg[0].tor" -type "double3" -180 -3.2166454271421963e-15 -6.3429356456567209e-15 ;
	setAttr ".lr" -type "double3" 9.5416640443905503e-15 3.1805546814635168e-15 -3.1805546814635164e-15 ;
	setAttr ".rst" -type "double3" -0.029556234433329109 0.032510904546475788 -1.6229485642588899 ;
	setAttr ".rsrr" -type "double3" 3.1805546814635176e-15 -3.1805546814635168e-15 -9.5416640443905519e-15 ;
	setAttr -k on ".w0";
createNode scaleConstraint -n "Aproncollar_L_scaleConstraint1" -p "Aproncollar_L";
	rename -uid "BA040A4D-4273-06CC-DD03-8CAE6D0312D8";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_l_collarW0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr ".o" -type "double3" 1 1 -1 ;
	setAttr -k on ".w0";
createNode joint -n "Aproncollar_L_sub" -p "Apron_02";
	rename -uid "A3DFF43D-4149-5DD7-4628-F5A252D40A32";
	addAttr -ci true -sn "liw" -ln "lockInfluenceWeights" -min 0 -max 1 -at "bool";
	setAttr ".uoc" 1;
	setAttr ".oc" 2;
	setAttr ".mnrl" -type "double3" -360 -360 -360 ;
	setAttr ".mxrl" -type "double3" 360 360 360 ;
	setAttr ".jo" -type "double3" -89.674459301340406 89.999999999999986 0 ;
	setAttr ".bps" -type "matrix" 1 -3.3268111967235891e-16 -3.7524436680848356e-16 0
		 2.7246323797133394e-16 1 -8.6736173798849291e-19 0 3.2160474130996277e-16 1.6913553890773869e-16 1.0000000000000002 0
		 0.90967526306293978 20.342669535430424 1.3877787807814457e-17 1;
	setAttr ".radi" 0.5;
	setAttr ".liw" yes;
createNode parentConstraint -n "Aproncollar_L_sub_parentConstraint1" -p "Aproncollar_L_sub";
	rename -uid "590EA3FB-488C-2E1C-E130-5EB953C248B1";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_l_collarsubW0" -dv 1 -min 0 
		-at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr ".tg[0].tot" -type "double3" 0.0063925507469004827 -0.02046179263804504 
		-0.072910785675048842 ;
	setAttr ".tg[0].tor" -type "double3" 180 -2.6031516938530666e-14 31.090220730127921 ;
	setAttr ".lr" -type "double3" -6.3611093629270304e-15 -2.5444437451708134e-14 -1.2722218725854065e-14 ;
	setAttr ".rst" -type "double3" -1.4051325401571297 0.040326679010822555 -0.90967526306294033 ;
	setAttr ".rsrr" -type "double3" -1.2722218725854064e-14 -3.1805546814635174e-14 
		-1.9083328088781101e-14 ;
	setAttr -k on ".w0";
createNode scaleConstraint -n "Aproncollar_L_sub_scaleConstraint1" -p "Aproncollar_L_sub";
	rename -uid "861BA10B-4125-B958-E360-45A286F61BED";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_l_collarsubW0" -dv 1 -min 0 
		-at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr ".o" -type "double3" 1 1 -1 ;
	setAttr -k on ".w0";
createNode joint -n "Aproncollar_R_sub" -p "Apron_02";
	rename -uid "D23FF6BD-4252-0E18-E521-79BB146F18CC";
	addAttr -ci true -sn "liw" -ln "lockInfluenceWeights" -min 0 -max 1 -at "bool";
	setAttr ".uoc" 1;
	setAttr ".oc" 2;
	setAttr ".mnrl" -type "double3" -360 -360 -360 ;
	setAttr ".mxrl" -type "double3" 360 360 360 ;
	setAttr ".jo" -type "double3" -89.674459301340406 89.999999999999986 0 ;
	setAttr ".bps" -type "matrix" 1 -3.3268111967235891e-16 -3.7524436680848356e-16 0
		 2.7246323797133394e-16 1 -8.6736173798849291e-19 0 3.2160474130996277e-16 1.6913553890773869e-16 1.0000000000000002 0
		 -0.8429391341613941 20.35285915401894 0 1;
	setAttr ".radi" 0.53946147297944758;
	setAttr ".liw" yes;
createNode parentConstraint -n "Aproncollar_R_sub_parentConstraint1" -p "Aproncollar_R_sub";
	rename -uid "4F75F3E0-4D56-1C6A-EC75-24A626D29604";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_r_collarsubW0" -dv 1 -min 0 
		-at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr ".tg[0].tot" -type "double3" -0.0043468080915634033 0.0087368143197359416 
		-0.072910785675048856 ;
	setAttr ".tg[0].tor" -type "double3" -1.341796506242425e-15 1.6771414514200454e-14 
		29.426860659276642 ;
	setAttr ".lr" -type "double3" -1.4124500153760515e-30 -1.272221872585407e-14 1.272221872585407e-14 ;
	setAttr ".rst" -type "double3" -1.4153219942736044 0.040384573636483817 0.84293913416139354 ;
	setAttr ".rsrr" -type "double3" -6.3611093629270367e-15 -1.9083328088781104e-14 
		6.3611093629270367e-15 ;
	setAttr -k on ".w0";
createNode scaleConstraint -n "Aproncollar_R_sub_scaleConstraint1" -p "Aproncollar_R_sub";
	rename -uid "89DF4787-43AB-44A6-0215-02A385D94F16";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_r_collarsubW0" -dv 1 -min 0 
		-at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr -k on ".w0";
createNode parentConstraint -n "Apron_03_parentConstraint1" -p "Apron_03";
	rename -uid "E6003FDD-4A06-FB50-B495-B1A78A4EC596";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_01W0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr ".tg[0].tot" -type "double3" 0 -4.2991934634528661e-07 -1.8463651141331638e-07 ;
	setAttr ".tg[0].tor" -type "double3" -90.000000000000028 0.56726640985841359 -90 ;
	setAttr ".rst" -type "double3" 5.9164567891575885e-31 13.245091962048427 4.3639739097543577 ;
	setAttr -k on ".w0";
createNode scaleConstraint -n "Apron_03_scaleConstraint1" -p "Apron_03";
	rename -uid "0B758FAF-4D88-63C2-BFCD-89809455345C";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "apron_01W0" -dv 1 -min 0 -at "double";
	setAttr -k on ".nds";
	setAttr -k off ".v";
	setAttr -k off ".tx";
	setAttr -k off ".ty";
	setAttr -k off ".tz";
	setAttr -k off ".rx";
	setAttr -k off ".ry";
	setAttr -k off ".rz";
	setAttr -k off ".sx";
	setAttr -k off ".sy";
	setAttr -k off ".sz";
	setAttr ".erp" yes;
	setAttr -k on ".w0";
createNode transform -n "apron_mesh" -p "apron_rig";
	rename -uid "ED3CC566-4EFD-3ED5-65A6-5C9BEAFFB92F";
	setAttr -l on ".tx";
	setAttr -l on ".ty";
	setAttr -l on ".tz";
	setAttr -l on ".rx";
	setAttr -l on ".ry";
	setAttr -l on ".rz";
	setAttr -l on ".sx";
	setAttr -l on ".sy";
	setAttr -l on ".sz";
	setAttr ".rp" -type "double3" 0 12.758260376374547 4.4368849144462246 ;
	setAttr ".sp" -type "double3" 0 12.758260376374547 4.4368849144462246 ;
createNode mesh -n "apron_meshShape" -p "apron_mesh";
	rename -uid "10358ACD-4C41-373C-E8C9-3799FD342184";
	setAttr -k off ".v";
	setAttr ".ovdt" 2;
	setAttr ".ove" yes;
	setAttr ".vir" yes;
	setAttr ".vif" yes;
	setAttr ".pv" -type "double2" 0.49558413028717041 0.48830613493919373 ;
	setAttr ".uvst[0].uvsn" -type "string" "map1";
	setAttr ".cuvs" -type "string" "map1";
	setAttr ".dcc" -type "string" "Ambient+Diffuse";
	setAttr ".covm[0]"  0 1 1;
	setAttr ".cdvm[0]"  0 1 1;
	setAttr ".vcs" 2;
	setAttr ".ai_translator" -type "string" "polymesh";
createNode mesh -n "apron_meshShapeOrig" -p "apron_mesh";
	rename -uid "5B0F01BF-4FAD-3886-4182-149F4E5BE59F";
	setAttr -k off ".v";
	setAttr ".io" yes;
	setAttr ".vir" yes;
	setAttr ".vif" yes;
	setAttr -s 11 ".gtag";
	setAttr ".gtag[0].gtagnm" -type "string" "back";
	setAttr ".gtag[0].gtagcmp" -type "componentList" 2 "e[10:11]" "e[27:28]";
	setAttr ".gtag[1].gtagnm" -type "string" "cluster1";
	setAttr ".gtag[1].gtagcmp" -type "componentList" 3 "vtx[16:17]" "vtx[46:47]" "vtx[70]";
	setAttr ".gtag[2].gtagnm" -type "string" "cluster1_1";
	setAttr ".gtag[2].gtagcmp" -type "componentList" 3 "vtx[16:17]" "vtx[46:47]" "vtx[70]";
	setAttr ".gtag[3].gtagnm" -type "string" "cluster1_2";
	setAttr ".gtag[3].gtagcmp" -type "componentList" 3 "vtx[7:8]" "vtx[37:38]" "vtx[62]";
	setAttr ".gtag[4].gtagnm" -type "string" "cluster2";
	setAttr ".gtag[4].gtagcmp" -type "componentList" 3 "vtx[7:8]" "vtx[37:38]" "vtx[62]";
	setAttr ".gtag[5].gtagnm" -type "string" "cluster2_1";
	setAttr ".gtag[5].gtagcmp" -type "componentList" 3 "vtx[7:8]" "vtx[37:38]" "vtx[62]";
	setAttr ".gtag[6].gtagnm" -type "string" "cluster2_2";
	setAttr ".gtag[6].gtagcmp" -type "componentList" 3 "vtx[16:17]" "vtx[46:47]" "vtx[70]";
	setAttr ".gtag[7].gtagnm" -type "string" "front";
	setAttr ".gtag[7].gtagcmp" -type "componentList" 4 "e[0]" "e[2]" "e[17]" "e[19]";
	setAttr ".gtag[8].gtagnm" -type "string" "left";
	setAttr ".gtag[8].gtagcmp" -type "componentList" 4 "e[1]" "e[6]" "e[18]" "e[23]";
	setAttr ".gtag[9].gtagnm" -type "string" "right";
	setAttr ".gtag[9].gtagcmp" -type "componentList" 4 "e[4]" "e[9]" "e[21]" "e[26]";
	setAttr ".gtag[10].gtagnm" -type "string" "rim";
	setAttr ".gtag[10].gtagcmp" -type "componentList" 8 "e[0:2]" "e[4]" "e[6]" "e[9:11]" "e[17:19]" "e[21]" "e[23]" "e[26:28]";
	setAttr ".uvst[0].uvsn" -type "string" "map1";
	setAttr -s 114 ".uvst[0].uvsp[0:113]" -type "float2" 0.42766404 0.13641971
		 0.29747659 0.10157192 0.55525506 0.26637954 0.69063979 0.70602024 0.46275973 0.41967046
		 0.69149482 0.58838701 0.82810956 0.54968148 0.75605017 0.28149772 0.38655704 0.68806708
		 0.81767392 0.70471394 0.69055223 0.83187532 0.76975811 0.81069052 0.56417382 0.70329249
		 0.61155242 0.80997634 0.55410558 0.5482077 0.1341089 0.42085332 0.62608534 0.28286719
		 0.21273077 0.68897033 0.040638864 0.26798296 0.16748466 0.13720301 0.6897825 0.17486501
		 0.68916339 0.15300107 0.68469501 0.18323159 0.28544438 0.80820704 0.69445914 0.18232751
		 0.3127718 0.80953264 0.29921263 0.8198638 0.27234519 0.83863199 0.27816683 0.84735405
		 0.31635731 0.84476733 0.32366383 0.83522153 0.29759687 0.14469624 0.29795372 0.27177197
		 0.42258206 0.27072078 0.37539303 0.1655215 0.21991904 0.16599649 0.17333227 0.27151504
		 0.69142151 0.59647536 0.83536106 0.55278569 0.7638669 0.27848744 0.78579634 0.27951384
		 0.85763443 0.55369228 0.95054841 0.70675254 0.82297063 0.83914405 0.69054878 0.87504613
		 0.5469324 0.55156994 0.52457029 0.55275726 0.59631622 0.28082991 0.61819744 0.27987492
		 0.43151009 0.70628923 0.55857164 0.83826774 0.70006782 0.17661476 0.70460516 0.1605978
		 0.68947273 0.16942906 0.67882413 0.17780232 0.67341244 0.16287518 0.66334385 0.13066006
		 0.67085344 0.12241697 0.70181721 0.12461329 0.71162319 0.13330793 0.56166792 0.26340324
		 0.86274421 0.55383056 0.78941023 0.27521038 0.70755398 0.15478969 0.7172206 0.12749171
		 0.70065284 0.11624765 0.68901533 0.14503479 0.67136961 0.11476088 0.65800911 0.12562013
		 0.67019236 0.1571331 0.5926919 0.27653015 0.51945257 0.5529108 0.42510158 0.70924085
		 0.55557263 0.84481603 0.69055569 0.88241023 0.8259896 0.84568 0.43061507 0.12984031
		 0.95696032 0.70964956 0.29745609 0.094202042 0.16449703 0.13063926 0.03420794 0.26504302
		 0.12899262 0.42085248 0.20904458 0.69309378 0.28172934 0.81301153 0.26603699 0.84274495
		 0.27882898 0.85498786 0.29890794 0.82793665 0.31496429 0.85289979 0.33042866 0.83963943
		 0.31642926 0.81423688 0.39028281 0.69214463 0.46787497 0.41963387 0.30455536 0.79621267
		 0.29951388 0.80426931 0.29375982 0.79531991 0.23498666 0.69104886 0.36432469 0.69033313
		 0.15648109 0.42120737 0.29827598 0.38391519 0.44039524 0.42018938 0.25066173 0.76175517
		 0.63706636 0.20816688 0.25436446 0.75724179 0.26863846 0.75075138 0.65964353 0.22581875
		 0.65291053 0.22143114 0.6404593 0.21329248 0.3453697 0.75586987 0.72166967 0.22614034
		 0.33096111 0.74943566 0.72825384 0.22162153 0.74047494 0.21313423 0.34905735 0.76029718
		 0.74371755 0.20799085;
	setAttr ".cuvs" -type "string" "map1";
	setAttr ".dcc" -type "string" "Ambient+Diffuse";
	setAttr ".covm[0]"  0 1 1;
	setAttr ".cdvm[0]"  0 1 1;
	setAttr -s 86 ".vt[0:85]"  2.78786206 7.27007198 4.43688393 1.1258104e-22 6.51725388 4.43688393
		 5.53287554 10.11560535 4.43688393 3.45532465 13.29501152 4.43688393 1.1258104e-22 12.47617912 4.43688393
		 1.1258104e-22 10.11560535 4.43688393 2.98657632 13.29501247 4.43688393 1.84466529 18.977705 4.43688488
		 1.37591517 18.99926758 4.43688488 2.68781042 10.11560535 4.43688393 1.1258104e-22 7.43166733 4.43688393
		 1.66937351 7.88124847 4.43688536 -2.78786206 7.27007198 4.43688393 -5.53287554 10.11560535 4.43688393
		 -3.45532465 13.29501152 4.43688393 -2.98657632 13.29501247 4.43688393 -1.84466529 18.977705 4.43688488
		 -1.37591517 18.99926758 4.43688488 -2.68781042 10.11560535 4.43688393 -1.66937351 7.88124847 4.43688536
		 -0.015588929 21.7181263 4.43688393 -0.015588814 21.36449242 4.43688393 -0.1375826 21.17530251 4.43688393
		 -0.28175336 21.46100616 4.43688393 0.093642712 21.19509506 4.43688393 0.23346537 21.4879055 4.43688393
		 -0.73565435 22.06545639 4.30705881 -0.52463311 22.26930809 4.30705881 0.63780499 21.95439148 4.40537739
		 0.37418115 22.19808006 4.40537739 -7.7550784e-09 7.43166733 4.25917578 -2.0202553e-09 10.11560535 4.25917578
		 2.68781042 10.11560535 4.25917578 1.66937351 7.88124847 4.25917721 -8.9259273e-17 12.47617912 4.25917625
		 2.98657632 13.29501247 4.25917625 3.45532465 13.29501152 4.25917625 1.37591517 18.99926758 4.25917721
		 1.84466529 18.977705 4.25917721 5.53287554 10.11560535 4.25917625 2.78786206 7.27007198 4.25917625
		 -1.0403929e-08 6.51725388 4.25917625 -1.66937351 7.88124847 4.25917721 -2.68781042 10.11560535 4.25917578
		 -2.98657632 13.29501247 4.25917625 -3.45532465 13.29501152 4.25917625 -1.84466541 18.977705 4.25917721
		 -1.37591529 18.99926758 4.25917721 -5.53287554 10.11560535 4.25917625 -2.78786206 7.27007198 4.25917625
		 0.093642712 21.19509506 4.25917625 0.23496148 21.48952293 4.25929737 -0.1375826 21.17530251 4.25917625
		 -0.28167841 21.46092796 4.25917625 -0.014017636 21.71966743 4.25929737 -0.015588788 21.36449242 4.25917625
		 -0.73550427 22.065299988 4.12935114 -0.52448297 22.26915169 4.12935114 0.37817645 22.20240211 4.1684432
		 0.64180028 21.95871353 4.1684432 5.62273455 10.046132088 4.34785366 3.51144242 13.27717495 4.34785366
		 1.87462437 19.052160263 4.34785461 0.45378491 21.5825367 4.34791422 0.73439544 21.99146843 4.28667498
		 0.38229236 22.32703781 4.28667498 -0.015042116 21.83787537 4.33841801 -0.53307718 22.39714432 4.21802855
		 -0.8346346 22.083133698 4.21802855 -0.41823521 21.51125336 4.34785366 -1.87462437 19.052160263 4.34785461
		 -3.51144242 13.27717495 4.34785366 -5.62273455 10.046132088 4.34785366 -2.83313966 7.15438509 4.34785366
		 -5.2969509e-09 6.3893404 4.34785366 2.83313966 7.15438509 4.34785366 -1.040738344 20.46016312 4.34785366
		 -0.94978756 20.39957047 4.43688393 -0.6668821 20.24520111 4.43688393 -0.66688216 20.24520111 4.25917673
		 -0.94974464 20.3995266 4.25917673 0.94528425 20.37891388 4.4368844 0.66014338 20.22499084 4.4368844
		 0.66014338 20.22499084 4.25917673 0.94611943 20.37981606 4.25924444 1.08150363 20.46463013 4.34788799;
	setAttr -s 172 ".ed";
	setAttr ".ed[0:165]"  0 1 0 0 2 0 2 3 0 3 6 1 1 10 0 2 9 1 4 5 0 6 4 0 3 7 0
		 6 8 0 7 8 0 10 5 0 9 5 1 6 9 1 9 11 1 11 10 1 11 0 1 12 1 0 12 13 0 13 14 0 14 15 1
		 13 18 1 15 4 0 14 16 0 15 17 0 16 17 0 18 5 1 15 18 1 18 19 1 19 10 1 19 12 1 7 81 0
		 8 82 0 20 21 0 16 77 0 17 78 0 22 21 0 23 20 1 22 23 1 24 21 0 25 20 1 24 25 1 23 26 0
		 20 27 0 26 27 0 25 28 0 20 29 0 28 29 0 30 31 0 32 31 1 32 33 1 33 30 1 4 34 0 34 31 0
		 6 35 0 35 34 0 35 32 1 3 61 1 36 35 1 8 37 1 35 37 0 7 62 1 38 37 0 36 38 0 2 60 0
		 39 36 0 39 32 1 0 75 0 40 39 0 33 40 1 1 74 0 41 30 0 40 41 0 42 30 1 43 42 1 43 31 1
		 15 44 0 44 43 1 44 34 0 14 71 1 16 70 1 45 46 0 17 47 1 46 47 0 44 47 0 45 44 1 13 72 0
		 48 43 1 48 45 0 12 73 0 42 49 1 49 48 0 49 41 0 24 50 1 37 83 0 25 63 0 50 51 1 38 84 0
		 22 52 1 23 69 0 52 53 1 20 66 0 53 54 1 21 55 0 54 55 0 52 55 0 46 80 0 47 79 0 50 55 0
		 51 54 1 26 68 0 53 56 0 27 67 0 56 57 0 54 57 0 29 65 0 54 58 0 28 64 0 59 58 0 51 59 0
		 60 39 0 61 36 1 60 61 1 62 38 1 61 62 1 63 51 0 62 85 1 64 59 0 63 64 1 65 58 0 64 65 1
		 66 54 0 65 66 1 67 57 0 66 67 1 68 56 0 67 68 1 69 53 0 68 69 1 70 46 1 69 76 1 71 45 1
		 70 71 1 72 48 0 71 72 1 73 49 0 72 73 1 74 41 0 73 74 1 75 40 0 74 75 1 75 60 1 76 70 1
		 77 23 0 76 77 1 78 22 0 77 78 1 79 52 0 78 79 1 80 53 0 79 80 1 80 76 1 81 25 0 82 24 0
		 81 82 1 83 50 0;
	setAttr ".ed[166:171]" 82 83 1 84 51 0 83 84 1 85 63 1 84 85 1 85 81 1;
	setAttr -s 86 -ch 344 ".fc[0:85]" -type "polyFaces" 
		f 4 48 -50 50 51
		mu 0 4 10 3 9 11
		f 4 -54 -56 56 49
		mu 0 4 3 37 38 9
		f 4 58 60 -63 -64
		mu 0 4 41 38 39 40
		f 4 -59 -66 66 -57
		mu 0 4 38 41 42 9
		f 4 -67 -69 -70 -51
		mu 0 4 9 42 43 11
		f 4 71 -52 69 72
		mu 0 4 44 10 11 43
		f 4 -74 -75 75 -49
		mu 0 4 10 13 12 3
		f 4 -76 -78 78 53
		mu 0 4 3 12 45 37
		f 4 81 83 -85 -86
		mu 0 4 46 47 48 45
		f 4 77 -88 88 85
		mu 0 4 45 12 49 46
		f 4 74 90 91 87
		mu 0 4 12 13 50 49
		f 4 -93 -91 73 -72
		mu 0 4 44 50 13 10
		f 4 62 94 168 -98
		mu 0 4 40 39 110 111
		f 4 100 102 104 -106
		mu 0 4 54 55 21 53
		f 4 160 159 -101 -158
		mu 0 4 105 106 55 54
		f 4 -97 108 -105 -110
		mu 0 4 52 51 53 21
		f 4 -103 111 113 -115
		mu 0 4 21 55 56 57
		f 4 109 116 -119 -120
		mu 0 4 52 21 58 59
		f 4 -16 -15 12 -12
		mu 0 4 31 34 33 32
		f 4 -13 -14 7 6
		mu 0 4 32 33 99 98
		f 4 8 10 -10 -4
		mu 0 4 4 8 96 99
		f 4 13 -6 2 3
		mu 0 4 99 33 2 4
		f 4 14 16 1 5
		mu 0 4 33 34 0 2
		f 4 -1 -17 15 -5
		mu 0 4 1 0 34 31
		f 4 11 -27 28 29
		mu 0 4 31 32 36 35
		f 4 -7 -23 27 26
		mu 0 4 32 98 97 36
		f 4 20 24 -26 -24
		mu 0 4 15 97 95 17
		f 4 -21 -20 21 -28
		mu 0 4 97 15 18 36
		f 4 -22 -19 -31 -29
		mu 0 4 36 18 19 35
		f 4 4 -30 30 17
		mu 0 4 1 31 35 19
		f 4 31 164 -33 -11
		mu 0 4 8 107 109 96
		f 4 36 -34 -38 -39
		mu 0 4 94 93 26 23
		f 4 155 38 -154 156
		mu 0 4 103 94 23 102
		f 4 40 33 -40 41
		mu 0 4 25 26 93 92
		f 4 43 -45 -43 37
		mu 0 4 26 28 27 23
		f 4 45 47 -47 -41
		mu 0 4 25 30 29 26
		f 4 -8 54 55 -53
		mu 0 4 5 6 38 37
		f 4 9 59 -61 -55
		mu 0 4 6 7 39 38
		f 4 -9 57 124 -62
		mu 0 4 8 4 91 90
		f 4 -3 64 122 -58
		mu 0 4 4 2 60 91
		f 4 -2 67 151 -65
		mu 0 4 2 0 76 60
		f 4 0 70 150 -68
		mu 0 4 0 1 78 76
		f 4 22 52 -79 -77
		mu 0 4 14 5 37 45
		f 4 23 80 142 -80
		mu 0 4 15 17 82 81
		f 4 -25 76 84 -83
		mu 0 4 16 14 45 48
		f 4 19 79 144 -87
		mu 0 4 18 15 81 80
		f 4 18 86 146 -90
		mu 0 4 19 18 80 79
		f 4 -18 89 148 -71
		mu 0 4 1 19 79 78
		f 4 32 166 -95 -60
		mu 0 4 7 108 110 39
		f 4 171 -32 61 126
		mu 0 4 112 107 8 90
		f 4 -37 98 105 -104
		mu 0 4 20 22 54 53
		f 4 153 99 140 154
		mu 0 4 102 23 83 100
		f 4 -156 158 157 -99
		mu 0 4 22 104 105 54
		f 4 39 103 -109 -94
		mu 0 4 24 20 53 51
		f 4 42 110 138 -100
		mu 0 4 23 27 84 83
		f 4 44 112 136 -111
		mu 0 4 27 28 85 84
		f 4 -44 101 134 -113
		mu 0 4 28 26 86 85
		f 4 46 115 132 -102
		mu 0 4 26 29 87 86
		f 4 -48 117 130 -116
		mu 0 4 29 30 88 87
		f 4 -46 95 128 -118
		mu 0 4 30 25 89 88
		f 4 -123 120 65 -122
		mu 0 4 61 77 42 41
		f 4 -125 121 63 -124
		mu 0 4 62 61 41 40
		f 4 -127 123 97 170
		mu 0 4 113 62 40 111
		f 4 -129 125 119 -128
		mu 0 4 64 63 52 59
		f 4 -131 127 118 -130
		mu 0 4 65 64 59 58
		f 4 -133 129 -117 -132
		mu 0 4 66 65 58 21
		f 4 -135 131 114 -134
		mu 0 4 67 66 21 57
		f 4 -137 133 -114 -136
		mu 0 4 68 67 57 56
		f 4 -139 135 -112 -138
		mu 0 4 69 68 56 55
		f 4 161 -141 137 -160
		mu 0 4 106 101 69 55
		f 4 -143 139 -82 -142
		mu 0 4 71 70 47 46
		f 4 -145 141 -89 -144
		mu 0 4 72 71 46 49
		f 4 -147 143 -92 -146
		mu 0 4 73 72 49 50
		f 4 -149 145 92 -148
		mu 0 4 74 73 50 44
		f 4 -151 147 -73 -150
		mu 0 4 75 74 44 43
		f 4 -152 149 68 -121
		mu 0 4 77 75 43 42
		f 4 34 -155 152 -81
		mu 0 4 17 102 100 82
		f 4 35 -157 -35 25
		mu 0 4 95 103 102 17
		f 4 -159 -36 82 107
		mu 0 4 105 104 16 48
		f 4 -84 106 -161 -108
		mu 0 4 48 47 106 105
		f 4 -153 -162 -107 -140
		mu 0 4 70 101 106 47
		f 4 162 -42 -164 -165
		mu 0 4 107 25 92 109
		f 4 -167 163 93 -166
		mu 0 4 110 108 24 51
		f 4 -169 165 96 -168
		mu 0 4 111 110 51 52
		f 4 -170 -171 167 -126
		mu 0 4 63 113 111 52
		f 4 -163 -172 169 -96
		mu 0 4 25 107 112 89;
	setAttr ".cd" -type "dataPolyComponent" Index_Data Edge 0 ;
	setAttr ".cvd" -type "dataPolyComponent" Index_Data Vertex 0 ;
	setAttr ".pd[0]" -type "dataPolyComponent" Index_Data UV 50 
		0 0 
		1 0 
		2 0 
		3 0 
		4 0 
		5 0 
		6 0 
		7 0 
		8 0 
		10 0 
		14 0 
		15 0 
		16 0 
		17 0 
		18 0 
		19 0 
		20 0 
		21 0 
		22 0 
		23 0 
		24 0 
		25 0 
		26 0 
		27 0 
		28 0 
		29 0 
		30 0 
		31 0 
		32 0 
		37 0 
		38 0 
		39 0 
		40 0 
		41 0 
		44 0 
		45 0 
		46 0 
		47 0 
		48 0 
		52 0 
		53 0 
		55 0 
		61 0 
		62 0 
		63 0 
		66 0 
		69 0 
		70 0 
		71 0 
		74 0 ;
	setAttr ".hfd" -type "dataPolyComponent" Index_Data Face 0 ;
	setAttr ".vcs" 2;
createNode transform -n "apron_placer_ctrl" -p "apron_rig";
	rename -uid "1BCBD9D7-4EF3-02A5-2E6B-28AB70D626AB";
	setAttr ".rp" -type "double3" 0 0 4.3639740943908691 ;
	setAttr ".sp" -type "double3" 0 0 4.3639740943908691 ;
createNode nurbsCurve -n "apron_placer_ctrlShape" -p "apron_placer_ctrl";
	rename -uid "2C4F02A3-4A04-C7FC-C197-66851D65F007";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 14;
	setAttr ".cc" -type "nurbsCurve" 
		1 4 0 no 3
		5 0 1.4142135623730949 2.8284271247461898 4.2426406871192848 5.6568542494923797
		
		5
		-10.117767159404739 8.8817841970012523e-16 -5.753793065013868
		-10.117767159404737 0 14.481741253795606
		10.117767159404737 -8.8817841970012523e-16 14.481741253795606
		10.117767159404739 0 -5.753793065013868
		-10.117767159404737 8.8817841970012523e-16 -5.7537930650138698
		;
createNode nurbsCurve -n "apron_placer_ctrlShape1" -p "apron_placer_ctrl";
	rename -uid "B57F6838-4B0B-5D7F-0B20-07869541CBB6";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 14;
	setAttr ".cc" -type "nurbsCurve" 
		1 4 0 no 3
		5 0 1.4142135623730949 2.8284271247461898 4.2426406871192848 5.6568542494923797
		
		5
		-10.822260619284322 8.8817841970012523e-16 -6.4582865248934489
		-10.82226061928432 0 15.186234713675189
		10.82226061928432 -8.8817841970012523e-16 15.186234713675189
		10.822260619284322 0 -6.4582865248934489
		-10.822260619284318 8.8817841970012523e-16 -6.4582865248934525
		;
createNode transform -n "apron_base_offset" -p "apron_placer_ctrl";
	rename -uid "A47C770B-4EB8-E095-54C9-94ACB66FB672";
	setAttr ".rp" -type "double3" 5.9164567891575885e-31 13.245092391967773 4.3639740943908691 ;
	setAttr ".sp" -type "double3" 5.9164567891575885e-31 13.245092391967773 4.3639740943908691 ;
createNode transform -n "apron_base" -p "apron_base_offset";
	rename -uid "7116F2F0-4A77-DD92-B7E6-0EB7B5CCAAEB";
	setAttr ".rp" -type "double3" 5.9164567891575885e-31 13.245092391967773 4.3639740943908691 ;
	setAttr ".sp" -type "double3" 5.9164567891575885e-31 13.245092391967773 4.3639740943908691 ;
createNode nurbsCurve -n "apron_baseShape" -p "apron_base";
	rename -uid "87CBF186-46B8-BBEA-E4D9-EB935155CBF2";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 14;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		7.545710575043743 13.245092391967773 2.6568543416738764
		5.6446391172061755e-16 13.245092391967773 1.9497421875034979
		-7.545710575043743 13.245092391967773 2.6568543416738764
		-8.1910744654143937 13.245092391967773 4.3639740943908691
		-7.545710575043743 13.245092391967773 6.0710938471078624
		-9.2341295679648104e-16 13.245092391967773 6.7782060012782397
		7.545710575043743 13.245092391967773 6.0710938471078624
		8.1910744654143937 13.245092391967773 4.3639740943908691
		7.545710575043743 13.245092391967773 2.6568543416738764
		5.6446391172061755e-16 13.245092391967773 1.9497421875034979
		-7.545710575043743 13.245092391967773 2.6568543416738764
		;
createNode transform -n "apron_02_offset" -p "apron_base";
	rename -uid "4B4C09BE-45BE-191F-9EE6-69848B36A8BF";
	setAttr ".rp" -type "double3" 5.9164567891575885e-31 18.93733024597168 4.3639740943908683 ;
	setAttr ".sp" -type "double3" 5.9164567891575885e-31 18.93733024597168 4.3639740943908683 ;
createNode transform -n "apron_02" -p "apron_02_offset";
	rename -uid "4653F7C0-4839-97F9-F14D-2B83AD80C9D8";
	setAttr ".rp" -type "double3" 5.9164567891575885e-31 18.93733024597168 4.3639740943908683 ;
	setAttr ".sp" -type "double3" 5.9164567891575885e-31 18.93733024597168 4.3639740943908683 ;
createNode nurbsCurve -n "apron_Shape2" -p "apron_02";
	rename -uid "EE99FFF9-4B0B-CF52-6A21-C28406F22089";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 17;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		3.1872137279382025 18.93733024597168 3.4086026861168568
		2.3842249321247292e-16 18.93733024597168 3.0128748917062786
		-3.1872137279382025 18.93733024597168 3.4086026861168572
		-3.4598073598365513 18.93733024597168 4.3639740943908683
		-3.1872137279382025 18.93733024597168 5.3193455026648797
		-3.9003807834766967e-16 18.93733024597168 5.7150732970754587
		3.1872137279382025 18.93733024597168 5.3193455026648797
		3.4598073598365513 18.93733024597168 4.3639740943908683
		3.1872137279382025 18.93733024597168 3.4086026861168568
		2.3842249321247292e-16 18.93733024597168 3.0128748917062786
		-3.1872137279382025 18.93733024597168 3.4086026861168572
		;
createNode transform -n "apron_03_offset" -p "apron_02";
	rename -uid "525CEC8E-4D64-F00D-0559-C48A71D15271";
	setAttr ".rp" -type "double3" 5.9164567891575885e-31 21.494277954101562 4.3639740943908674 ;
	setAttr ".sp" -type "double3" 5.9164567891575885e-31 21.494277954101562 4.3639740943908674 ;
createNode transform -n "apron_03" -p "apron_03_offset";
	rename -uid "7F0BD88C-45A3-C370-23F0-A68C89B67B6D";
	setAttr ".rp" -type "double3" 5.9164567891575885e-31 21.494277954101562 4.3639740943908674 ;
	setAttr ".sp" -type "double3" 5.9164567891575885e-31 21.494277954101562 4.3639740943908674 ;
createNode nurbsCurve -n "apron_Shape3" -p "apron_03";
	rename -uid "27571A9E-4260-58AA-905D-E4A86A5204C1";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 17;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		2.1960944322096996 21.494277954101562 3.4086026861168559
		1.6428089063113459e-16 21.494277954101562 3.0128748917062778
		-2.1960944322096996 21.494277954101562 3.4086026861168564
		-2.3839203542745642 21.494277954101562 4.3639740943908674
		-2.1960944322096996 21.494277954101562 5.3193455026648788
		-2.6874898432468592e-16 21.494277954101562 5.7150732970754579
		2.1960944322096996 21.494277954101562 5.3193455026648779
		2.3839203542745642 21.494277954101562 4.3639740943908674
		2.1960944322096996 21.494277954101562 3.4086026861168559
		1.6428089063113459e-16 21.494277954101562 3.0128748917062778
		-2.1960944322096996 21.494277954101562 3.4086026861168564
		;
createNode transform -n "apron_l_collar_offset" -p "apron_02";
	rename -uid "B7BA8C39-48F1-A232-5DE4-81A9AEF3FD3C";
	setAttr ".t" -type "double3" 1.6076670327021194 18.977705001831055 4.436884880065918 ;
	setAttr ".r" -type "double3" 0 180 0 ;
	setAttr ".s" -type "double3" 1 1 -1 ;
createNode transform -n "apron_l_collar" -p "apron_l_collar_offset";
	rename -uid "C48A8E3C-42F2-1F3C-52A4-2FB3582DA3D9";
createNode nurbsCurve -n "apron_l_collarShape" -p "apron_l_collar";
	rename -uid "2844FD9B-456E-EA43-93AC-FAB316BCBB47";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 9;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		0.45487128883868272 2.7852833395016192e-17 -0.45487128883868283
		3.9389854737750124e-17 3.9389854737750124e-17 -0.64328514580979423
		-0.45487128883868272 2.7852833395016186e-17 -0.45487128883868266
		-0.64328514580979446 -8.2999764550139109e-33 1.0638003796668365e-16
		-0.45487128883868272 -2.7852833395016192e-17 0.45487128883868272
		-6.4438313018623501e-17 -3.9389854737750161e-17 0.64328514580979457
		0.45487128883868272 -2.7852833395016186e-17 0.45487128883868266
		0.64328514580979446 -1.5713534063248638e-32 2.2745262172546762e-16
		0.45487128883868272 2.7852833395016192e-17 -0.45487128883868283
		3.9389854737750124e-17 3.9389854737750124e-17 -0.64328514580979423
		-0.45487128883868272 2.7852833395016186e-17 -0.45487128883868266
		;
createNode transform -n "apron_r_collar_offset" -p "apron_02";
	rename -uid "704FCE5A-4A17-54AB-12C7-579DD467C84B";
	setAttr ".t" -type "double3" -1.6076670327021194 18.977705001831055 4.436884880065918 ;
createNode transform -n "apron_r_collar" -p "apron_r_collar_offset";
	rename -uid "927879CF-4796-F112-CCAA-1ABA5C9B1D53";
createNode nurbsCurve -n "apron_r_collarShape" -p "apron_r_collar";
	rename -uid "35E8DA65-4D88-D78C-C2A2-438097D82E31";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 9;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		0.45487128883868272 2.7852833395016192e-17 -0.45487128883868283
		3.9389854737750124e-17 3.9389854737750124e-17 -0.64328514580979423
		-0.45487128883868272 2.7852833395016186e-17 -0.45487128883868266
		-0.64328514580979446 -8.2999764550139109e-33 1.0638003796668365e-16
		-0.45487128883868272 -2.7852833395016192e-17 0.45487128883868272
		-6.4438313018623501e-17 -3.9389854737750161e-17 0.64328514580979457
		0.45487128883868272 -2.7852833395016186e-17 0.45487128883868266
		0.64328514580979446 -1.5713534063248638e-32 2.2745262172546762e-16
		0.45487128883868272 2.7852833395016192e-17 -0.45487128883868283
		3.9389854737750124e-17 3.9389854737750124e-17 -0.64328514580979423
		-0.45487128883868272 2.7852833395016186e-17 -0.45487128883868266
		;
createNode transform -n "apron_r_collarsub_offset" -p "apron_02";
	rename -uid "75B0B604-40F7-6867-B955-C884D17FFBAF";
	setAttr ".t" -type "double3" -0.843445638563602 20.343113892691871 4.436884880065918 ;
	setAttr ".r" -type "double3" 0 0 -29.426860659276656 ;
createNode transform -n "apron_r_collarsub" -p "apron_r_collarsub_offset";
	rename -uid "2AE7D0F0-4918-8E41-BFAA-BC83B549E5AC";
createNode nurbsCurve -n "apron_r_collarsubShape" -p "apron_r_collarsub";
	rename -uid "A24CA054-40C4-3883-B2F8-A0AE1BD603DD";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 9;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		0.45487128883868272 2.7852833395016192e-17 -0.45487128883868283
		3.9389854737750124e-17 3.9389854737750124e-17 -0.64328514580979423
		-0.45487128883868272 2.7852833395016186e-17 -0.45487128883868266
		-0.64328514580979446 -8.2999764550139109e-33 1.0638003796668365e-16
		-0.45487128883868272 -2.7852833395016192e-17 0.45487128883868272
		-6.4438313018623501e-17 -3.9389854737750161e-17 0.64328514580979457
		0.45487128883868272 -2.7852833395016186e-17 0.45487128883868266
		0.64328514580979446 -1.5713534063248638e-32 2.2745262172546762e-16
		0.45487128883868272 2.7852833395016192e-17 -0.45487128883868283
		3.9389854737750124e-17 3.9389854737750124e-17 -0.64328514580979423
		-0.45487128883868272 2.7852833395016186e-17 -0.45487128883868266
		;
createNode transform -n "apron_l_collarsub_offset" -p "apron_02";
	rename -uid "C90E2F73-4B56-2BBC-DC4D-B7896FCD06FA";
	setAttr ".t" -type "double3" 0.90458335009468382 20.363493129868896 4.436884880065918 ;
	setAttr ".r" -type "double3" 0 180 31.090220730127882 ;
	setAttr ".s" -type "double3" 1 1 -1 ;
createNode transform -n "apron_l_collarsub" -p "apron_l_collarsub_offset";
	rename -uid "B63D4138-493A-21F6-FCFA-648880AA427B";
	setAttr ".t" -type "double3" 0 -5.0792703376600912e-15 2.0683734526420264e-17 ;
createNode nurbsCurve -n "apron_l_collarsubShape" -p "apron_l_collarsub";
	rename -uid "767B61FC-445D-7CA6-A043-F98BD7072D9E";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 9;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		0.45487128883868272 2.7852833395016192e-17 -0.45487128883868283
		3.9389854737750124e-17 3.9389854737750124e-17 -0.64328514580979423
		-0.45487128883868272 2.7852833395016186e-17 -0.45487128883868266
		-0.64328514580979446 -8.2999764550139109e-33 1.0638003796668365e-16
		-0.45487128883868272 -2.7852833395016192e-17 0.45487128883868272
		-6.4438313018623501e-17 -3.9389854737750161e-17 0.64328514580979457
		0.45487128883868272 -2.7852833395016186e-17 0.45487128883868266
		0.64328514580979446 -1.5713534063248638e-32 2.2745262172546762e-16
		0.45487128883868272 2.7852833395016192e-17 -0.45487128883868283
		3.9389854737750124e-17 3.9389854737750124e-17 -0.64328514580979423
		-0.45487128883868272 2.7852833395016186e-17 -0.45487128883868266
		;
createNode transform -n "apron_04_offset" -p "apron_base";
	rename -uid "C265FD31-48C1-FB7C-AB5B-3592A6772FCD";
	setAttr ".t" -type "double3" 5.9164567891575885e-31 10.115605354309082 4.3639740943908691 ;
createNode transform -n "apron_04" -p "apron_04_offset";
	rename -uid "66D73320-4203-341A-5BA0-B2A935C60B81";
createNode nurbsCurve -n "apron_Shape4" -p "apron_04";
	rename -uid "A52E3859-424F-CF8E-EFC6-1D822F72BA9F";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 17;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		5.8567073108364021 0 -0.9553714082740109
		4.3811644849077553e-16 0 -1.3510992026845894
		-5.8567073108364021 0 -0.9553714082740109
		-6.3576153932884933 0 0
		-5.8567073108364021 0 0.95537140827401201
		-7.1671969938492712e-16 0 1.3510992026845907
		5.8567073108364021 0 0.95537140827401201
		6.3576153932884933 0 0
		5.8567073108364021 0 -0.9553714082740109
		4.3811644849077553e-16 0 -1.3510992026845894
		-5.8567073108364021 0 -0.9553714082740109
		;
createNode transform -n "apron_05_offset" -p "apron_04";
	rename -uid "3FB7C1BD-4FB1-8C99-0A98-51B03D001E83";
	setAttr ".t" -type "double3" 0 -0.6461088157083732 -4.4408920985006262e-16 ;
	setAttr ".rp" -type "double3" 0 -2.3617218041036372 -9.7339886320685922e-17 ;
	setAttr ".sp" -type "double3" 0 -2.3617218041036372 -9.7339886320685922e-17 ;
createNode transform -n "apron_05_offset" -p "|apron_rig|apron_placer_ctrl|apron_base_offset|apron_base|apron_04_offset|apron_04|apron_05_offset";
	rename -uid "AF69515A-45A2-3C6F-6E0C-83865E66B1AF";
	setAttr ".rp" -type "double3" 0 -2.3617218041036372 -9.7339886320685922e-17 ;
	setAttr ".sp" -type "double3" 0 -2.3617218041036372 -9.7339886320685922e-17 ;
createNode nurbsCurve -n "apron_05_offsetShape" -p "|apron_rig|apron_placer_ctrl|apron_base_offset|apron_base|apron_04_offset|apron_04|apron_05_offset|apron_05_offset";
	rename -uid "476B0E5D-4312-AA31-BE6B-38B0662AB144";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 17;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		4.2228766476599704 -2.3617218041036376 -0.95537140827401168
		3.1589622309864091e-16 -2.3617218041036376 -1.3510992026845898
		-4.2228766476599704 -2.3617218041036376 -0.95537140827401168
		-4.5840476831490191 -2.3617218041036376 -2.7950104615994242e-16
		-4.2228766476599704 -2.3617218041036376 0.9553714082740099
		-5.1677823746637728e-16 -2.3617218041036376 1.3510992026845898
		4.2228766476599704 -2.3617218041036376 0.9553714082740099
		4.5840476831490191 -2.3617218041036376 -2.7950104615994242e-16
		4.2228766476599704 -2.3617218041036376 -0.95537140827401168
		3.1589622309864091e-16 -2.3617218041036376 -1.3510992026845898
		-4.2228766476599704 -2.3617218041036376 -0.95537140827401168
		;
createNode transform -n "apron_01_offset" -p "apron_base";
	rename -uid "7E05A20F-4445-2BDF-59AE-D2A08C028661";
	setAttr ".rp" -type "double3" 5.9164567891575885e-31 13.245092391967773 4.3639740943908691 ;
	setAttr ".sp" -type "double3" 5.9164567891575885e-31 13.245092391967773 4.3639740943908691 ;
createNode transform -n "apron_01" -p "apron_01_offset";
	rename -uid "96063016-4607-2883-D74F-1DA38EA4FE89";
	setAttr ".rp" -type "double3" 5.9164567891575885e-31 13.245092391967773 4.3639740943908691 ;
	setAttr ".sp" -type "double3" 5.9164567891575885e-31 13.245092391967773 4.3639740943908691 ;
createNode nurbsCurve -n "apron_Shape1" -p "apron_01";
	rename -uid "E76EF7C6-48E8-E9E7-849D-DCA57DB3700A";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 17;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		4.115180603690674 13.245092391967773 3.4329675278532381
		3.0783992016319619e-16 13.245092391967773 3.0473319813349438
		-4.115180603690674 13.245092391967773 3.4329675278532381
		-4.4671406924806245 13.245092391967773 4.3639740943908691
		-4.115180603690674 13.245092391967773 5.2949806609285055
		-5.0359883952791374e-16 13.245092391967773 5.680616207446799
		4.115180603690674 13.245092391967773 5.2949806609285055
		4.4671406924806245 13.245092391967773 4.3639740943908691
		4.115180603690674 13.245092391967773 3.4329675278532381
		3.0783992016319619e-16 13.245092391967773 3.0473319813349438
		-4.115180603690674 13.245092391967773 3.4329675278532381
		;
createNode lightLinker -s -n "lightLinker1";
	rename -uid "C2DAEDF4-403B-A8C0-9DF9-E892F25AAA27";
	setAttr -s 3 ".lnk";
	setAttr -s 3 ".slnk";
createNode shapeEditorManager -n "shapeEditorManager";
	rename -uid "142BD7EC-484C-30F1-2444-C998812AB8C3";
	setAttr ".bsdt[0].bscd" -type "Int32Array" 0 ;
createNode poseInterpolatorManager -n "poseInterpolatorManager";
	rename -uid "93EF8271-4816-BE1E-391E-3C8F473ED513";
createNode displayLayerManager -n "layerManager";
	rename -uid "998987F2-46E6-03E5-CB9A-5FA64061D32C";
createNode displayLayer -n "defaultLayer";
	rename -uid "B7C0EF88-49C9-F7F9-A589-13A15FC330AB";
createNode renderLayerManager -n "renderLayerManager";
	rename -uid "0320F18D-44C4-830E-46C0-63B72289BE43";
createNode renderLayer -n "defaultRenderLayer";
	rename -uid "941B7F8E-48A3-0AF7-4CB7-38881B142F76";
	setAttr ".g" yes;
createNode script -n "uiConfigurationScriptNode";
	rename -uid "C400213A-4185-B150-10FF-3AAD869BA6C4";
	setAttr ".b" -type "string" (
		"// Maya Mel UI Configuration File.\n//\n//  This script is machine generated.  Edit at your own risk.\n//\n//\n\nglobal string $gMainPane;\nif (`paneLayout -exists $gMainPane`) {\n\n\tglobal int $gUseScenePanelConfig;\n\tint    $useSceneConfig = $gUseScenePanelConfig;\n\tint    $nodeEditorPanelVisible = stringArrayContains(\"nodeEditorPanel1\", `getPanel -vis`);\n\tint    $nodeEditorWorkspaceControlOpen = (`workspaceControl -exists nodeEditorPanel1Window` && `workspaceControl -q -visible nodeEditorPanel1Window`);\n\tint    $menusOkayInPanels = `optionVar -q allowMenusInPanels`;\n\tint    $nVisPanes = `paneLayout -q -nvp $gMainPane`;\n\tint    $nPanes = 0;\n\tstring $editorName;\n\tstring $panelName;\n\tstring $itemFilterName;\n\tstring $panelConfig;\n\n\t//\n\t//  get current state of the UI\n\t//\n\tsceneUIReplacement -update $gMainPane;\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Top View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Top View\")) -mbv $menusOkayInPanels  $panelName;\n"
		+ "\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|top\" \n            -useInteractiveMode 0\n            -displayLights \"default\" \n            -displayAppearance \"smoothShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n            -wireframeOnShaded 0\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 1\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n            -xray 0\n            -jointXray 1\n            -activeComponentsXray 0\n            -displayTextures 0\n            -smoothWireframe 0\n            -lineWidth 1\n            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n"
		+ "            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -rendererName \"vp2Renderer\" \n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 256 256 \n            -bumpResolution 512 512 \n            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 1\n            -occlusionCulling 0\n            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n            -interactiveBackFaceCull 0\n            -sortTransparent 1\n            -controllers 1\n            -nurbsCurves 1\n            -nurbsSurfaces 1\n            -polymeshes 1\n            -subdivSurfaces 1\n            -planes 1\n            -lights 1\n            -cameras 1\n            -controlVertices 1\n"
		+ "            -hulls 1\n            -grid 1\n            -imagePlane 1\n            -joints 1\n            -ikHandles 1\n            -deformers 1\n            -dynamics 1\n            -particleInstancers 1\n            -fluids 1\n            -hairSystems 1\n            -follicles 1\n            -nCloths 1\n            -nParticles 1\n            -nRigids 1\n            -dynamicConstraints 1\n            -locators 1\n            -manipulators 1\n            -pluginShapes 1\n            -dimensions 1\n            -handles 1\n            -pivots 1\n            -textures 1\n            -strokes 1\n            -motionTrails 1\n            -clipGhosts 1\n            -greasePencils 1\n            -shadows 0\n            -captureSequenceNumber -1\n            -width 553\n            -height 498\n            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 1 \n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n"
		+ "\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Side View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Side View\")) -mbv $menusOkayInPanels  $panelName;\n\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|side\" \n            -useInteractiveMode 0\n            -displayLights \"default\" \n            -displayAppearance \"smoothShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n            -wireframeOnShaded 1\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 0\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n            -xray 0\n            -jointXray 1\n            -activeComponentsXray 0\n            -displayTextures 0\n            -smoothWireframe 0\n            -lineWidth 1\n            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n"
		+ "            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -rendererName \"vp2Renderer\" \n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 256 256 \n            -bumpResolution 512 512 \n            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 1\n            -occlusionCulling 0\n            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n            -interactiveBackFaceCull 0\n"
		+ "            -sortTransparent 1\n            -controllers 1\n            -nurbsCurves 1\n            -nurbsSurfaces 1\n            -polymeshes 1\n            -subdivSurfaces 1\n            -planes 1\n            -lights 1\n            -cameras 1\n            -controlVertices 1\n            -hulls 1\n            -grid 1\n            -imagePlane 1\n            -joints 1\n            -ikHandles 1\n            -deformers 1\n            -dynamics 1\n            -particleInstancers 1\n            -fluids 1\n            -hairSystems 1\n            -follicles 1\n            -nCloths 1\n            -nParticles 1\n            -nRigids 1\n            -dynamicConstraints 1\n            -locators 1\n            -manipulators 1\n            -pluginShapes 1\n            -dimensions 1\n            -handles 1\n            -pivots 1\n            -textures 1\n            -strokes 1\n            -motionTrails 1\n            -clipGhosts 1\n            -greasePencils 1\n            -shadows 0\n            -captureSequenceNumber -1\n            -width 553\n            -height 498\n"
		+ "            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 1 \n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Front View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Front View\")) -mbv $menusOkayInPanels  $panelName;\n\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|front\" \n            -useInteractiveMode 0\n            -displayLights \"default\" \n            -displayAppearance \"smoothShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n            -wireframeOnShaded 1\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 0\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n"
		+ "            -xray 0\n            -jointXray 1\n            -activeComponentsXray 0\n            -displayTextures 0\n            -smoothWireframe 0\n            -lineWidth 1\n            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -rendererName \"vp2Renderer\" \n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 256 256 \n            -bumpResolution 512 512 \n            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 1\n            -occlusionCulling 0\n"
		+ "            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n            -interactiveBackFaceCull 0\n            -sortTransparent 1\n            -controllers 1\n            -nurbsCurves 1\n            -nurbsSurfaces 1\n            -polymeshes 1\n            -subdivSurfaces 1\n            -planes 1\n            -lights 1\n            -cameras 1\n            -controlVertices 1\n            -hulls 1\n            -grid 1\n            -imagePlane 1\n            -joints 1\n            -ikHandles 1\n            -deformers 1\n            -dynamics 1\n            -particleInstancers 1\n            -fluids 1\n            -hairSystems 1\n            -follicles 1\n            -nCloths 1\n            -nParticles 1\n            -nRigids 1\n            -dynamicConstraints 1\n            -locators 1\n            -manipulators 1\n            -pluginShapes 1\n            -dimensions 1\n            -handles 1\n            -pivots 1\n"
		+ "            -textures 1\n            -strokes 1\n            -motionTrails 1\n            -clipGhosts 1\n            -greasePencils 1\n            -shadows 0\n            -captureSequenceNumber -1\n            -width 553\n            -height 498\n            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 1 \n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Persp View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Persp View\")) -mbv $menusOkayInPanels  $panelName;\n\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|persp\" \n            -useInteractiveMode 0\n            -displayLights \"flat\" \n            -displayAppearance \"flatShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n"
		+ "            -wireframeOnShaded 0\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 0\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n            -xray 0\n            -jointXray 1\n            -activeComponentsXray 0\n            -displayTextures 1\n            -smoothWireframe 0\n            -lineWidth 1\n            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -rendererName \"vp2Renderer\" \n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 256 256 \n            -bumpResolution 512 512 \n"
		+ "            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 1\n            -occlusionCulling 0\n            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n            -interactiveBackFaceCull 0\n            -sortTransparent 1\n            -controllers 1\n            -nurbsCurves 1\n            -nurbsSurfaces 1\n            -polymeshes 1\n            -subdivSurfaces 1\n            -planes 1\n            -lights 1\n            -cameras 1\n            -controlVertices 1\n            -hulls 1\n            -grid 1\n            -imagePlane 1\n            -joints 1\n            -ikHandles 1\n            -deformers 1\n            -dynamics 1\n            -particleInstancers 1\n            -fluids 1\n            -hairSystems 1\n            -follicles 1\n"
		+ "            -nCloths 1\n            -nParticles 1\n            -nRigids 1\n            -dynamicConstraints 1\n            -locators 1\n            -manipulators 1\n            -pluginShapes 1\n            -dimensions 1\n            -handles 1\n            -pivots 1\n            -textures 1\n            -strokes 1\n            -motionTrails 1\n            -clipGhosts 1\n            -greasePencils 1\n            -shadows 0\n            -captureSequenceNumber -1\n            -width 1113\n            -height 1040\n            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 1 \n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"outlinerPanel\" (localizedPanelLabel(\"ToggledOutliner\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\toutlinerPanel -edit -l (localizedPanelLabel(\"ToggledOutliner\")) -mbv $menusOkayInPanels  $panelName;\n"
		+ "\t\t$editorName = $panelName;\n        outlinerEditor -e \n            -docTag \"isolOutln_fromSeln\" \n            -showShapes 0\n            -showAssignedMaterials 0\n            -showTimeEditor 1\n            -showReferenceNodes 0\n            -showReferenceMembers 0\n            -showAttributes 0\n            -showConnected 0\n            -showAnimCurvesOnly 0\n            -showMuteInfo 0\n            -organizeByLayer 1\n            -organizeByClip 1\n            -showAnimLayerWeight 1\n            -autoExpandLayers 1\n            -autoExpand 0\n            -showDagOnly 1\n            -showAssets 1\n            -showContainedOnly 1\n            -showPublishedAsConnected 0\n            -showParentContainers 0\n            -showContainerContents 1\n            -ignoreDagHierarchy 0\n            -expandConnections 0\n            -showUpstreamCurves 1\n            -showUnitlessCurves 1\n            -showCompounds 1\n            -showLeafs 1\n            -showNumericAttrsOnly 0\n            -highlightActive 1\n            -autoSelectNewObjects 0\n"
		+ "            -doNotSelectNewObjects 0\n            -dropIsParent 1\n            -transmitFilters 0\n            -setFilter \"defaultSetFilter\" \n            -showSetMembers 1\n            -allowMultiSelection 1\n            -alwaysToggleSelect 0\n            -directSelect 0\n            -isSet 0\n            -isSetMember 0\n            -displayMode \"DAG\" \n            -expandObjects 0\n            -setsIgnoreFilters 1\n            -containersIgnoreFilters 0\n            -editAttrName 0\n            -showAttrValues 0\n            -highlightSecondary 0\n            -showUVAttrsOnly 0\n            -showTextureNodesOnly 0\n            -attrAlphaOrder \"default\" \n            -animLayerFilterOptions \"allAffecting\" \n            -sortOrder \"none\" \n            -longNames 0\n            -niceNames 1\n            -showNamespace 1\n            -showPinIcons 0\n            -mapMotionTrails 0\n            -ignoreHiddenAttribute 0\n            -ignoreOutlinerColor 0\n            -renderFilterVisible 0\n            -renderFilterIndex 0\n            -selectionOrder \"chronological\" \n"
		+ "            -expandAttribute 0\n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"outlinerPanel\" (localizedPanelLabel(\"Outliner\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\toutlinerPanel -edit -l (localizedPanelLabel(\"Outliner\")) -mbv $menusOkayInPanels  $panelName;\n\t\t$editorName = $panelName;\n        outlinerEditor -e \n            -showShapes 0\n            -showAssignedMaterials 0\n            -showTimeEditor 1\n            -showReferenceNodes 0\n            -showReferenceMembers 0\n            -showAttributes 0\n            -showConnected 0\n            -showAnimCurvesOnly 0\n            -showMuteInfo 0\n            -organizeByLayer 1\n            -organizeByClip 1\n            -showAnimLayerWeight 1\n            -autoExpandLayers 1\n            -autoExpand 0\n            -showDagOnly 1\n            -showAssets 1\n            -showContainedOnly 1\n            -showPublishedAsConnected 0\n            -showParentContainers 0\n"
		+ "            -showContainerContents 1\n            -ignoreDagHierarchy 0\n            -expandConnections 0\n            -showUpstreamCurves 1\n            -showUnitlessCurves 1\n            -showCompounds 1\n            -showLeafs 1\n            -showNumericAttrsOnly 0\n            -highlightActive 1\n            -autoSelectNewObjects 0\n            -doNotSelectNewObjects 0\n            -dropIsParent 1\n            -transmitFilters 0\n            -setFilter \"defaultSetFilter\" \n            -showSetMembers 1\n            -allowMultiSelection 1\n            -alwaysToggleSelect 0\n            -directSelect 0\n            -displayMode \"DAG\" \n            -expandObjects 0\n            -setsIgnoreFilters 1\n            -containersIgnoreFilters 0\n            -editAttrName 0\n            -showAttrValues 0\n            -highlightSecondary 0\n            -showUVAttrsOnly 0\n            -showTextureNodesOnly 0\n            -attrAlphaOrder \"default\" \n            -animLayerFilterOptions \"allAffecting\" \n            -sortOrder \"none\" \n            -longNames 0\n"
		+ "            -niceNames 1\n            -showNamespace 1\n            -showPinIcons 0\n            -mapMotionTrails 0\n            -ignoreHiddenAttribute 0\n            -ignoreOutlinerColor 0\n            -renderFilterVisible 0\n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"graphEditor\" (localizedPanelLabel(\"Graph Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Graph Editor\")) -mbv $menusOkayInPanels  $panelName;\n\n\t\t\t$editorName = ($panelName+\"OutlineEd\");\n            outlinerEditor -e \n                -showShapes 1\n                -showAssignedMaterials 0\n                -showTimeEditor 1\n                -showReferenceNodes 0\n                -showReferenceMembers 0\n                -showAttributes 1\n                -showConnected 1\n                -showAnimCurvesOnly 1\n                -showMuteInfo 0\n                -organizeByLayer 1\n                -organizeByClip 1\n"
		+ "                -showAnimLayerWeight 1\n                -autoExpandLayers 1\n                -autoExpand 1\n                -showDagOnly 0\n                -showAssets 1\n                -showContainedOnly 0\n                -showPublishedAsConnected 0\n                -showParentContainers 0\n                -showContainerContents 0\n                -ignoreDagHierarchy 0\n                -expandConnections 1\n                -showUpstreamCurves 1\n                -showUnitlessCurves 1\n                -showCompounds 0\n                -showLeafs 1\n                -showNumericAttrsOnly 1\n                -highlightActive 0\n                -autoSelectNewObjects 1\n                -doNotSelectNewObjects 0\n                -dropIsParent 1\n                -transmitFilters 1\n                -setFilter \"0\" \n                -showSetMembers 0\n                -allowMultiSelection 1\n                -alwaysToggleSelect 0\n                -directSelect 0\n                -displayMode \"DAG\" \n                -expandObjects 0\n                -setsIgnoreFilters 1\n"
		+ "                -containersIgnoreFilters 0\n                -editAttrName 0\n                -showAttrValues 0\n                -highlightSecondary 0\n                -showUVAttrsOnly 0\n                -showTextureNodesOnly 0\n                -attrAlphaOrder \"default\" \n                -animLayerFilterOptions \"allAffecting\" \n                -sortOrder \"none\" \n                -longNames 0\n                -niceNames 1\n                -showNamespace 1\n                -showPinIcons 1\n                -mapMotionTrails 1\n                -ignoreHiddenAttribute 0\n                -ignoreOutlinerColor 0\n                -renderFilterVisible 0\n                $editorName;\n\n\t\t\t$editorName = ($panelName+\"GraphEd\");\n            animCurveEditor -e \n                -displayValues 0\n                -snapTime \"integer\" \n                -snapValue \"none\" \n                -showPlayRangeShades \"on\" \n                -lockPlayRangeShades \"off\" \n                -smoothness \"fine\" \n                -resultSamples 1\n                -resultScreenSamples 0\n"
		+ "                -resultUpdate \"delayed\" \n                -showUpstreamCurves 1\n                -keyMinScale 1\n                -stackedCurvesMin -1\n                -stackedCurvesMax 1\n                -stackedCurvesSpace 0.2\n                -preSelectionHighlight 0\n                -constrainDrag 0\n                -valueLinesToggle 1\n                -outliner \"graphEditor1OutlineEd\" \n                -highlightAffectedCurves 0\n                $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"dopeSheetPanel\" (localizedPanelLabel(\"Dope Sheet\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Dope Sheet\")) -mbv $menusOkayInPanels  $panelName;\n\n\t\t\t$editorName = ($panelName+\"OutlineEd\");\n            outlinerEditor -e \n                -showShapes 1\n                -showAssignedMaterials 0\n                -showTimeEditor 1\n                -showReferenceNodes 0\n                -showReferenceMembers 0\n"
		+ "                -showAttributes 1\n                -showConnected 1\n                -showAnimCurvesOnly 1\n                -showMuteInfo 0\n                -organizeByLayer 1\n                -organizeByClip 1\n                -showAnimLayerWeight 1\n                -autoExpandLayers 1\n                -autoExpand 0\n                -showDagOnly 0\n                -showAssets 1\n                -showContainedOnly 0\n                -showPublishedAsConnected 0\n                -showParentContainers 0\n                -showContainerContents 0\n                -ignoreDagHierarchy 0\n                -expandConnections 1\n                -showUpstreamCurves 1\n                -showUnitlessCurves 0\n                -showCompounds 1\n                -showLeafs 1\n                -showNumericAttrsOnly 1\n                -highlightActive 0\n                -autoSelectNewObjects 0\n                -doNotSelectNewObjects 1\n                -dropIsParent 1\n                -transmitFilters 0\n                -setFilter \"0\" \n                -showSetMembers 0\n"
		+ "                -allowMultiSelection 1\n                -alwaysToggleSelect 0\n                -directSelect 0\n                -displayMode \"DAG\" \n                -expandObjects 0\n                -setsIgnoreFilters 1\n                -containersIgnoreFilters 0\n                -editAttrName 0\n                -showAttrValues 0\n                -highlightSecondary 0\n                -showUVAttrsOnly 0\n                -showTextureNodesOnly 0\n                -attrAlphaOrder \"default\" \n                -animLayerFilterOptions \"allAffecting\" \n                -sortOrder \"none\" \n                -longNames 0\n                -niceNames 1\n                -showNamespace 1\n                -showPinIcons 0\n                -mapMotionTrails 1\n                -ignoreHiddenAttribute 0\n                -ignoreOutlinerColor 0\n                -renderFilterVisible 0\n                $editorName;\n\n\t\t\t$editorName = ($panelName+\"DopeSheetEd\");\n            dopeSheetEditor -e \n                -displayValues 0\n                -snapTime \"integer\" \n"
		+ "                -snapValue \"none\" \n                -outliner \"dopeSheetPanel1OutlineEd\" \n                -showSummary 1\n                -showScene 0\n                -hierarchyBelow 0\n                -showTicks 1\n                -selectionWindow 0 0 0 0 \n                $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"timeEditorPanel\" (localizedPanelLabel(\"Time Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Time Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"clipEditorPanel\" (localizedPanelLabel(\"Trax Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Trax Editor\")) -mbv $menusOkayInPanels  $panelName;\n\n\t\t\t$editorName = clipEditorNameFromPanel($panelName);\n"
		+ "            clipEditor -e \n                -displayValues 0\n                -snapTime \"none\" \n                -snapValue \"none\" \n                -initialized 0\n                -manageSequencer 0 \n                $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"sequenceEditorPanel\" (localizedPanelLabel(\"Camera Sequencer\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Camera Sequencer\")) -mbv $menusOkayInPanels  $panelName;\n\n\t\t\t$editorName = sequenceEditorNameFromPanel($panelName);\n            clipEditor -e \n                -displayValues 0\n                -snapTime \"none\" \n                -snapValue \"none\" \n                -initialized 0\n                -manageSequencer 1 \n                $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"hyperGraphPanel\" (localizedPanelLabel(\"Hypergraph Hierarchy\")) `;\n"
		+ "\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Hypergraph Hierarchy\")) -mbv $menusOkayInPanels  $panelName;\n\n\t\t\t$editorName = ($panelName+\"HyperGraphEd\");\n            hyperGraph -e \n                -graphLayoutStyle \"hierarchicalLayout\" \n                -orientation \"horiz\" \n                -mergeConnections 0\n                -zoom 1\n                -animateTransition 0\n                -showRelationships 1\n                -showShapes 0\n                -showDeformers 0\n                -showExpressions 0\n                -showConstraints 0\n                -showConnectionFromSelected 0\n                -showConnectionToSelected 0\n                -showConstraintLabels 0\n                -showUnderworld 0\n                -showInvisible 0\n                -transitionFrames 1\n                -opaqueContainers 0\n                -freeform 0\n                -imagePosition 0 0 \n                -imageScale 1\n                -imageEnabled 0\n                -graphType \"DAG\" \n"
		+ "                -heatMapDisplay 0\n                -updateSelection 1\n                -updateNodeAdded 1\n                -useDrawOverrideColor 0\n                -limitGraphTraversal -1\n                -range 0 0 \n                -iconSize \"smallIcons\" \n                -showCachedConnections 0\n                $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"hyperShadePanel\" (localizedPanelLabel(\"Hypershade\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Hypershade\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"visorPanel\" (localizedPanelLabel(\"Visor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Visor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n"
		+ "\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"nodeEditorPanel\" (localizedPanelLabel(\"Node Editor\")) `;\n\tif ($nodeEditorPanelVisible || $nodeEditorWorkspaceControlOpen) {\n\t\tif (\"\" == $panelName) {\n\t\t\tif ($useSceneConfig) {\n\t\t\t\t$panelName = `scriptedPanel -unParent  -type \"nodeEditorPanel\" -l (localizedPanelLabel(\"Node Editor\")) -mbv $menusOkayInPanels `;\n\n\t\t\t$editorName = ($panelName+\"NodeEditorEd\");\n            nodeEditor -e \n                -allAttributes 0\n                -allNodes 0\n                -autoSizeNodes 1\n                -consistentNameSize 1\n                -createNodeCommand \"nodeEdCreateNodeCommand\" \n                -connectNodeOnCreation 0\n                -connectOnDrop 0\n                -copyConnectionsOnPaste 0\n                -connectionStyle \"bezier\" \n                -defaultPinnedState 0\n                -additiveGraphingMode 0\n                -settingsChangedCallback \"nodeEdSyncControls\" \n                -traversalDepthLimit -1\n                -keyPressCommand \"nodeEdKeyPressCommand\" \n"
		+ "                -nodeTitleMode \"name\" \n                -gridSnap 0\n                -gridVisibility 1\n                -crosshairOnEdgeDragging 0\n                -popupMenuScript \"nodeEdBuildPanelMenus\" \n                -showNamespace 1\n                -showShapes 1\n                -showSGShapes 0\n                -showTransforms 1\n                -useAssets 1\n                -syncedSelection 1\n                -extendToShapes 1\n                -editorMode \"default\" \n                -hasWatchpoint 0\n                $editorName;\n\t\t\t}\n\t\t} else {\n\t\t\t$label = `panel -q -label $panelName`;\n\t\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Node Editor\")) -mbv $menusOkayInPanels  $panelName;\n\n\t\t\t$editorName = ($panelName+\"NodeEditorEd\");\n            nodeEditor -e \n                -allAttributes 0\n                -allNodes 0\n                -autoSizeNodes 1\n                -consistentNameSize 1\n                -createNodeCommand \"nodeEdCreateNodeCommand\" \n                -connectNodeOnCreation 0\n                -connectOnDrop 0\n"
		+ "                -copyConnectionsOnPaste 0\n                -connectionStyle \"bezier\" \n                -defaultPinnedState 0\n                -additiveGraphingMode 0\n                -settingsChangedCallback \"nodeEdSyncControls\" \n                -traversalDepthLimit -1\n                -keyPressCommand \"nodeEdKeyPressCommand\" \n                -nodeTitleMode \"name\" \n                -gridSnap 0\n                -gridVisibility 1\n                -crosshairOnEdgeDragging 0\n                -popupMenuScript \"nodeEdBuildPanelMenus\" \n                -showNamespace 1\n                -showShapes 1\n                -showSGShapes 0\n                -showTransforms 1\n                -useAssets 1\n                -syncedSelection 1\n                -extendToShapes 1\n                -editorMode \"default\" \n                -hasWatchpoint 0\n                $editorName;\n\t\t\tif (!$useSceneConfig) {\n\t\t\t\tpanel -e -l $label $panelName;\n\t\t\t}\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"createNodePanel\" (localizedPanelLabel(\"Create Node\")) `;\n"
		+ "\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Create Node\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"polyTexturePlacementPanel\" (localizedPanelLabel(\"UV Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"UV Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"renderWindowPanel\" (localizedPanelLabel(\"Render View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Render View\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"shapePanel\" (localizedPanelLabel(\"Shape Editor\")) `;\n"
		+ "\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tshapePanel -edit -l (localizedPanelLabel(\"Shape Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"posePanel\" (localizedPanelLabel(\"Pose Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tposePanel -edit -l (localizedPanelLabel(\"Pose Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"dynRelEdPanel\" (localizedPanelLabel(\"Dynamic Relationships\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Dynamic Relationships\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"relationshipPanel\" (localizedPanelLabel(\"Relationship Editor\")) `;\n"
		+ "\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Relationship Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"referenceEditorPanel\" (localizedPanelLabel(\"Reference Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Reference Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"componentEditorPanel\" (localizedPanelLabel(\"Component Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Component Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"dynPaintScriptedPanelType\" (localizedPanelLabel(\"Paint Effects\")) `;\n"
		+ "\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Paint Effects\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"scriptEditorPanel\" (localizedPanelLabel(\"Script Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Script Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"profilerPanel\" (localizedPanelLabel(\"Profiler Tool\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Profiler Tool\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"contentBrowserPanel\" (localizedPanelLabel(\"Content Browser\")) `;\n"
		+ "\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Content Browser\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"Stereo\" (localizedPanelLabel(\"Stereo\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Stereo\")) -mbv $menusOkayInPanels  $panelName;\n{ string $editorName = ($panelName+\"Editor\");\n            stereoCameraView -e \n                -camera \"|persp\" \n                -useInteractiveMode 0\n                -displayLights \"default\" \n                -displayAppearance \"smoothShaded\" \n                -activeOnly 0\n                -ignorePanZoom 0\n                -wireframeOnShaded 0\n                -headsUpDisplay 1\n                -holdOuts 1\n                -selectionHiliteDisplay 1\n                -useDefaultMaterial 0\n                -bufferMode \"double\" \n                -twoSidedLighting 0\n"
		+ "                -backfaceCulling 0\n                -xray 0\n                -jointXray 0\n                -activeComponentsXray 0\n                -displayTextures 0\n                -smoothWireframe 0\n                -lineWidth 1\n                -textureAnisotropic 0\n                -textureHilight 1\n                -textureSampling 2\n                -textureDisplay \"modulate\" \n                -textureMaxSize 32768\n                -fogging 0\n                -fogSource \"fragment\" \n                -fogMode \"linear\" \n                -fogStart 0\n                -fogEnd 100\n                -fogDensity 0.1\n                -fogColor 0.5 0.5 0.5 1 \n                -depthOfFieldPreview 1\n                -maxConstantTransparency 1\n                -objectFilterShowInHUD 1\n                -isFiltered 0\n                -colorResolution 4 4 \n                -bumpResolution 4 4 \n                -textureCompression 0\n                -transparencyAlgorithm \"frontAndBackCull\" \n                -transpInShadows 0\n                -cullingOverride \"none\" \n"
		+ "                -lowQualityLighting 0\n                -maximumNumHardwareLights 0\n                -occlusionCulling 0\n                -shadingModel 0\n                -useBaseRenderer 0\n                -useReducedRenderer 0\n                -smallObjectCulling 0\n                -smallObjectThreshold -1 \n                -interactiveDisableShadows 0\n                -interactiveBackFaceCull 0\n                -sortTransparent 1\n                -controllers 1\n                -nurbsCurves 1\n                -nurbsSurfaces 1\n                -polymeshes 1\n                -subdivSurfaces 1\n                -planes 1\n                -lights 1\n                -cameras 1\n                -controlVertices 1\n                -hulls 1\n                -grid 1\n                -imagePlane 1\n                -joints 1\n                -ikHandles 1\n                -deformers 1\n                -dynamics 1\n                -particleInstancers 1\n                -fluids 1\n                -hairSystems 1\n                -follicles 1\n                -nCloths 1\n"
		+ "                -nParticles 1\n                -nRigids 1\n                -dynamicConstraints 1\n                -locators 1\n                -manipulators 1\n                -pluginShapes 1\n                -dimensions 1\n                -handles 1\n                -pivots 1\n                -textures 1\n                -strokes 1\n                -motionTrails 1\n                -clipGhosts 1\n                -greasePencils 1\n                -shadows 0\n                -captureSequenceNumber -1\n                -width 0\n                -height 0\n                -sceneRenderFilter 0\n                -displayMode \"centerEye\" \n                -viewColor 0 0 0 1 \n                -useCustomBackground 1\n                $editorName;\n            stereoCameraView -e -viewSelected 0 $editorName;\n            stereoCameraView -e \n                -pluginObjects \"gpuCacheDisplayFilter\" 1 \n                $editorName; };\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Model Panel5\")) `;\n"
		+ "\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Model Panel5\")) -mbv $menusOkayInPanels  $panelName;\n\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|persp\" \n            -useInteractiveMode 0\n            -displayLights \"all\" \n            -displayAppearance \"smoothShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n            -wireframeOnShaded 0\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 0\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n            -xray 0\n            -jointXray 0\n            -activeComponentsXray 0\n            -displayTextures 1\n            -smoothWireframe 0\n            -lineWidth 1\n            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n"
		+ "            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 4 4 \n            -bumpResolution 4 4 \n            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 0\n            -occlusionCulling 0\n            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n            -interactiveBackFaceCull 0\n            -sortTransparent 1\n            -controllers 0\n            -nurbsCurves 0\n            -nurbsSurfaces 0\n            -polymeshes 1\n"
		+ "            -subdivSurfaces 0\n            -planes 0\n            -lights 0\n            -cameras 0\n            -controlVertices 0\n            -hulls 0\n            -grid 1\n            -imagePlane 0\n            -joints 0\n            -ikHandles 0\n            -deformers 0\n            -dynamics 0\n            -particleInstancers 0\n            -fluids 0\n            -hairSystems 0\n            -follicles 0\n            -nCloths 0\n            -nParticles 0\n            -nRigids 0\n            -dynamicConstraints 0\n            -locators 0\n            -manipulators 1\n            -pluginShapes 0\n            -dimensions 0\n            -handles 0\n            -pivots 0\n            -textures 0\n            -strokes 0\n            -motionTrails 0\n            -clipGhosts 0\n            -greasePencils 0\n            -shadows 0\n            -captureSequenceNumber -1\n            -width 0\n            -height 0\n            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 0 \n"
		+ "            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Model Panel6\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Model Panel6\")) -mbv $menusOkayInPanels  $panelName;\n\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|persp\" \n            -useInteractiveMode 0\n            -displayLights \"all\" \n            -displayAppearance \"smoothShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n            -wireframeOnShaded 0\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 0\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n            -xray 0\n            -jointXray 0\n            -activeComponentsXray 0\n            -displayTextures 1\n            -smoothWireframe 0\n            -lineWidth 1\n"
		+ "            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 4 4 \n            -bumpResolution 4 4 \n            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 0\n            -occlusionCulling 0\n            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n"
		+ "            -interactiveBackFaceCull 0\n            -sortTransparent 1\n            -controllers 1\n            -nurbsCurves 0\n            -nurbsSurfaces 1\n            -polymeshes 1\n            -subdivSurfaces 1\n            -planes 1\n            -lights 0\n            -cameras 1\n            -controlVertices 1\n            -hulls 1\n            -grid 0\n            -imagePlane 1\n            -joints 1\n            -ikHandles 1\n            -deformers 1\n            -dynamics 1\n            -particleInstancers 1\n            -fluids 1\n            -hairSystems 1\n            -follicles 1\n            -nCloths 1\n            -nParticles 1\n            -nRigids 1\n            -dynamicConstraints 1\n            -locators 1\n            -manipulators 1\n            -pluginShapes 1\n            -dimensions 1\n            -handles 1\n            -pivots 1\n            -textures 1\n            -strokes 1\n            -motionTrails 1\n            -clipGhosts 1\n            -greasePencils 1\n            -shadows 1\n            -captureSequenceNumber -1\n"
		+ "            -width 0\n            -height 0\n            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 1 \n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\tif ($useSceneConfig) {\n        string $configName = `getPanel -cwl (localizedPanelLabel(\"Current Layout\"))`;\n        if (\"\" != $configName) {\n\t\t\tpanelConfiguration -edit -label (localizedPanelLabel(\"Current Layout\")) \n\t\t\t\t-userCreated false\n\t\t\t\t-defaultImage \"vacantCell.xP:/\"\n\t\t\t\t-image \"\"\n\t\t\t\t-sc false\n\t\t\t\t-configString \"global string $gMainPane; paneLayout -e -cn \\\"single\\\" -ps 1 100 100 $gMainPane;\"\n\t\t\t\t-removeAllPanels\n\t\t\t\t-ap false\n\t\t\t\t\t(localizedPanelLabel(\"Persp View\")) \n\t\t\t\t\t\"modelPanel\"\n"
		+ "\t\t\t\t\t\"$panelName = `modelPanel -unParent -l (localizedPanelLabel(\\\"Persp View\\\")) -mbv $menusOkayInPanels `;\\n$editorName = $panelName;\\nmodelEditor -e \\n    -cam `findStartUpCamera persp` \\n    -useInteractiveMode 0\\n    -displayLights \\\"flat\\\" \\n    -displayAppearance \\\"flatShaded\\\" \\n    -activeOnly 0\\n    -ignorePanZoom 0\\n    -wireframeOnShaded 0\\n    -headsUpDisplay 1\\n    -holdOuts 1\\n    -selectionHiliteDisplay 1\\n    -useDefaultMaterial 0\\n    -bufferMode \\\"double\\\" \\n    -twoSidedLighting 0\\n    -backfaceCulling 0\\n    -xray 0\\n    -jointXray 1\\n    -activeComponentsXray 0\\n    -displayTextures 1\\n    -smoothWireframe 0\\n    -lineWidth 1\\n    -textureAnisotropic 0\\n    -textureHilight 1\\n    -textureSampling 2\\n    -textureDisplay \\\"modulate\\\" \\n    -textureMaxSize 32768\\n    -fogging 0\\n    -fogSource \\\"fragment\\\" \\n    -fogMode \\\"linear\\\" \\n    -fogStart 0\\n    -fogEnd 100\\n    -fogDensity 0.1\\n    -fogColor 0.5 0.5 0.5 1 \\n    -depthOfFieldPreview 1\\n    -maxConstantTransparency 1\\n    -rendererName \\\"vp2Renderer\\\" \\n    -objectFilterShowInHUD 1\\n    -isFiltered 0\\n    -colorResolution 256 256 \\n    -bumpResolution 512 512 \\n    -textureCompression 0\\n    -transparencyAlgorithm \\\"frontAndBackCull\\\" \\n    -transpInShadows 0\\n    -cullingOverride \\\"none\\\" \\n    -lowQualityLighting 0\\n    -maximumNumHardwareLights 1\\n    -occlusionCulling 0\\n    -shadingModel 0\\n    -useBaseRenderer 0\\n    -useReducedRenderer 0\\n    -smallObjectCulling 0\\n    -smallObjectThreshold -1 \\n    -interactiveDisableShadows 0\\n    -interactiveBackFaceCull 0\\n    -sortTransparent 1\\n    -controllers 1\\n    -nurbsCurves 1\\n    -nurbsSurfaces 1\\n    -polymeshes 1\\n    -subdivSurfaces 1\\n    -planes 1\\n    -lights 1\\n    -cameras 1\\n    -controlVertices 1\\n    -hulls 1\\n    -grid 1\\n    -imagePlane 1\\n    -joints 1\\n    -ikHandles 1\\n    -deformers 1\\n    -dynamics 1\\n    -particleInstancers 1\\n    -fluids 1\\n    -hairSystems 1\\n    -follicles 1\\n    -nCloths 1\\n    -nParticles 1\\n    -nRigids 1\\n    -dynamicConstraints 1\\n    -locators 1\\n    -manipulators 1\\n    -pluginShapes 1\\n    -dimensions 1\\n    -handles 1\\n    -pivots 1\\n    -textures 1\\n    -strokes 1\\n    -motionTrails 1\\n    -clipGhosts 1\\n    -greasePencils 1\\n    -shadows 0\\n    -captureSequenceNumber -1\\n    -width 1113\\n    -height 1040\\n    -sceneRenderFilter 0\\n    $editorName;\\nmodelEditor -e -viewSelected 0 $editorName;\\nmodelEditor -e \\n    -pluginObjects \\\"gpuCacheDisplayFilter\\\" 1 \\n    $editorName\"\n"
		+ "\t\t\t\t\t\"modelPanel -edit -l (localizedPanelLabel(\\\"Persp View\\\")) -mbv $menusOkayInPanels  $panelName;\\n$editorName = $panelName;\\nmodelEditor -e \\n    -cam `findStartUpCamera persp` \\n    -useInteractiveMode 0\\n    -displayLights \\\"flat\\\" \\n    -displayAppearance \\\"flatShaded\\\" \\n    -activeOnly 0\\n    -ignorePanZoom 0\\n    -wireframeOnShaded 0\\n    -headsUpDisplay 1\\n    -holdOuts 1\\n    -selectionHiliteDisplay 1\\n    -useDefaultMaterial 0\\n    -bufferMode \\\"double\\\" \\n    -twoSidedLighting 0\\n    -backfaceCulling 0\\n    -xray 0\\n    -jointXray 1\\n    -activeComponentsXray 0\\n    -displayTextures 1\\n    -smoothWireframe 0\\n    -lineWidth 1\\n    -textureAnisotropic 0\\n    -textureHilight 1\\n    -textureSampling 2\\n    -textureDisplay \\\"modulate\\\" \\n    -textureMaxSize 32768\\n    -fogging 0\\n    -fogSource \\\"fragment\\\" \\n    -fogMode \\\"linear\\\" \\n    -fogStart 0\\n    -fogEnd 100\\n    -fogDensity 0.1\\n    -fogColor 0.5 0.5 0.5 1 \\n    -depthOfFieldPreview 1\\n    -maxConstantTransparency 1\\n    -rendererName \\\"vp2Renderer\\\" \\n    -objectFilterShowInHUD 1\\n    -isFiltered 0\\n    -colorResolution 256 256 \\n    -bumpResolution 512 512 \\n    -textureCompression 0\\n    -transparencyAlgorithm \\\"frontAndBackCull\\\" \\n    -transpInShadows 0\\n    -cullingOverride \\\"none\\\" \\n    -lowQualityLighting 0\\n    -maximumNumHardwareLights 1\\n    -occlusionCulling 0\\n    -shadingModel 0\\n    -useBaseRenderer 0\\n    -useReducedRenderer 0\\n    -smallObjectCulling 0\\n    -smallObjectThreshold -1 \\n    -interactiveDisableShadows 0\\n    -interactiveBackFaceCull 0\\n    -sortTransparent 1\\n    -controllers 1\\n    -nurbsCurves 1\\n    -nurbsSurfaces 1\\n    -polymeshes 1\\n    -subdivSurfaces 1\\n    -planes 1\\n    -lights 1\\n    -cameras 1\\n    -controlVertices 1\\n    -hulls 1\\n    -grid 1\\n    -imagePlane 1\\n    -joints 1\\n    -ikHandles 1\\n    -deformers 1\\n    -dynamics 1\\n    -particleInstancers 1\\n    -fluids 1\\n    -hairSystems 1\\n    -follicles 1\\n    -nCloths 1\\n    -nParticles 1\\n    -nRigids 1\\n    -dynamicConstraints 1\\n    -locators 1\\n    -manipulators 1\\n    -pluginShapes 1\\n    -dimensions 1\\n    -handles 1\\n    -pivots 1\\n    -textures 1\\n    -strokes 1\\n    -motionTrails 1\\n    -clipGhosts 1\\n    -greasePencils 1\\n    -shadows 0\\n    -captureSequenceNumber -1\\n    -width 1113\\n    -height 1040\\n    -sceneRenderFilter 0\\n    $editorName;\\nmodelEditor -e -viewSelected 0 $editorName;\\nmodelEditor -e \\n    -pluginObjects \\\"gpuCacheDisplayFilter\\\" 1 \\n    $editorName\"\n"
		+ "\t\t\t\t$configName;\n\n            setNamedPanelLayout (localizedPanelLabel(\"Current Layout\"));\n        }\n\n        panelHistory -e -clear mainPanelHistory;\n        sceneUIReplacement -clear;\n\t}\n\n\ngrid -spacing 5 -size 12 -divisions 5 -displayAxes yes -displayGridLines yes -displayDivisionLines yes -displayPerspectiveLabels no -displayOrthographicLabels no -displayAxesBold yes -perspectiveLabelPosition axis -orthographicLabelPosition edge;\nviewManip -drawCompass 0 -compassAngle 0 -frontParameters \"\" -homeParameters \"\" -selectionLockParameters \"\";\n}\n");
	setAttr ".st" 3;
createNode script -n "sceneConfigurationScriptNode";
	rename -uid "E2269F5A-4578-64C8-6AA3-9F886E853888";
	setAttr ".b" -type "string" "playbackOptions -min 1 -max 120 -ast 1 -aet 200 ";
	setAttr ".st" 6;
createNode reference -n "MauriceRig_v01RN";
	rename -uid "9D0C86C5-49DA-F16D-FE03-75A1324F416F";
	setAttr ".ed" -type "dataReferenceEdits" 
		"MauriceRig_v01RN"
		"MauriceRig_v01RN" 0;
	setAttr ".ptag" -type "string" "";
lockNode -l 1 ;
createNode lambert -n "apron_shd";
	rename -uid "2E7E3E37-49CC-E27D-23FE-7195DF6D2712";
createNode shadingEngine -n "lambert2SG";
	rename -uid "C7960467-46FC-228B-FD6C-E8A6D55E0116";
	setAttr ".ihi" 0;
	setAttr ".ro" yes;
createNode materialInfo -n "materialInfo1";
	rename -uid "F2EF8701-4F9C-CD55-BE4F-E0BD27649317";
createNode file -n "file1";
	rename -uid "BE02ACB4-45FF-6FE1-97E7-A6B29668839F";
	setAttr ".ftn" -type "string" "P:/Dropbox/$Gumroad_Store/RIGS/BOUNCYRACOON/sourceimages/apron_texture.jpg";
	setAttr ".ft" 0;
	setAttr ".cs" -type "string" "sRGB";
createNode place2dTexture -n "place2dTexture1";
	rename -uid "692E3974-42DB-F1CE-F712-4B8B44EBDCD7";
createNode reference -n "sharedReferenceNode";
	rename -uid "743CF5E0-4CCE-E656-9B1A-BBB61EE8C52C";
	setAttr ".ed" -type "dataReferenceEdits" 
		"sharedReferenceNode";
createNode skinCluster -n "skinCluster1";
	rename -uid "83E393C9-4406-9F9D-7A82-0193ABF9BA9D";
	setAttr -s 86 ".wl";
	setAttr ".wl[0:85].w"
		2 1 0.34245053080323923 2 0.65754946919676072
		2 1 0.12371175784260935 2 0.87628824215739065
		1 1 1
		1 0 1
		1 0 1
		1 1 1
		1 0 1
		1 8 1
		1 8 1
		1 1 1
		2 1 0.72063507331587651 2 0.27936492668412349
		2 1 0.38586550321936086 2 0.61413449678063914
		2 1 0.34245053080323923 2 0.65754946919676072
		1 1 1
		1 0 1
		1 0 1
		1 7 1
		1 7 1
		1 1 1
		2 1 0.38586550321936075 2 0.61413449678063925
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		2 1 0.78584653811160343 2 0.21415346188839657
		1 1 1
		1 1 1
		2 1 0.38594688930330989 2 0.61405311069669011
		1 0 1
		1 0 1
		1 0 1
		1 8 1
		1 8 1
		1 1 1
		2 1 0.34245676439596279 2 0.65754323560403716
		2 1 0.094284733453006114 2 0.90571526654699386
		2 1 0.38594688930330978 2 0.61405311069669022
		1 1 1
		1 0 1
		1 0 1
		1 7 1
		1 7 1
		1 1 1
		2 1 0.34245676439596279 2 0.65754323560403716
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 1 1
		1 0 1
		1 8 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 5 1
		1 7 1
		1 0 1
		1 1 1
		2 1 0.34051403113846818 2 0.65948596886153177
		2 1 0.020941182697803169 2 0.97905881730219679
		2 1 0.34051403113846812 2 0.65948596886153188
		2 5 0.00055881644190693548 10 0.99944118355809308
		2 5 8.0467611738396877e-05 10 0.99991953238826159
		2 5 0.00056600654569301581 10 0.99943399345430695
		2 5 0.00070784656878632439 10 0.99929215343121369
		2 5 0.00013576912651251918 10 0.99986423087348753
		2 5 0.053657143001780594 9 0.94634285699821941
		2 5 0.0015679426942012877 9 0.99843205730579876
		2 5 0.0017936171877439753 9 0.99820638281225604
		2 5 0.069361675188614802 9 0.9306383248113852
		2 5 0.11750667434238493 9 0.88249332565761507;
	setAttr -s 11 ".pm";
	setAttr ".pm[0]" -type "matrix" -4.3967073713441157e-18 -4.4406744450538555e-16 1 0
		 -0.99995098880091138 0.0099005048396213473 4.396707371344165e-18 0 -0.0099005048396212363 -0.99995098880091138 -4.4406744450538555e-16 0
		 13.244442802381332 -0.13113328169895241 -5.8234875454734046e-17 1;
	setAttr ".pm[1]" -type "matrix" -4.4720093308671617e-30 -4.4408920985006262e-16 1 0
		 -1 1.0181092080507881e-14 4.3967073713441658e-18 0 -1.0070069778045365e-14 -1 -4.4406744450538555e-16 0
		 10.115605354309082 -0.032342449344020481 -7.8982317856935017e-16 1;
	setAttr ".pm[2]" -type "matrix" -4.4720093308671617e-30 -4.4408920985006262e-16 1 0
		 -1 1.0181092080507881e-14 4.3967073713441658e-18 0 -1.0070069778045365e-14 -1 -4.4406744450538555e-16 0
		 7.1077747365202235 -0.032342449343990082 -1.4561287168075236e-15 1;
	setAttr ".pm[3]" -type "matrix" 1 3.3306690738754815e-16 3.3306690738755041e-16 0
		 -2.7315904878494497e-16 1.0000000000000002 1.4398204850607662e-16 0 -4.4406744450538555e-16 -1.9949319973733144e-16 1 0
		 4.857570969301979e-17 -6.0969422514656086 0.032342449343917584 1;
	setAttr ".pm[4]" -type "matrix" 2.5231934190068885e-18 3.2161736183005664e-16 -1 0
		 -0.99998385886188723 0.0056817264708114443 -5.0925181849551686e-18 0 0.0056817264708115553 0.99998385886188712 3.2160474130996277e-16 0
		 18.937208641434744 -0.07525480497560233 -4.609273366458054e-16 1;
	setAttr ".pm[5]" -type "matrix" -1.3127289036643824e-18 -8.8817847010402003e-16 1 0
		 -0.99998050040677477 0.0062449024184575404 8.6305919413338814e-18 0 -0.0062449024184574268 -0.99998050040677455 -8.881475835043698e-16 0
		 21.493756904947471 -0.15060360003358314 1.7922937257288344e-15 1;
	setAttr ".pm[6]" -type "matrix" 1 8.8358055428966463e-16 9.4922600519664347e-16 0
		 -8.2403667652753348e-16 1 3.4694469519535707e-18 0 -9.9916988596688556e-16 -5.984795992120072e-17 0.99999999999999978 0
		 1.9566166220563472e-14 -22.240572877530184 0.098802632507374311 1;
	setAttr ".pm[7]" -type "matrix" 1 3.3268111967235886e-16 3.7524436680848346e-16 0
		 -2.7246323797133394e-16 1 8.6736173798839045e-19 0 -3.2160474130996267e-16 -1.6913553890773874e-16 0.99999999999999978 0
		 1.6071605282999162 -18.987450263158131 5.9354784084517418e-16 1;
	setAttr ".pm[8]" -type "matrix" 1 3.3268111967235886e-16 3.7524436680848346e-16 0
		 -2.7246323797133394e-16 1 8.6736173798839045e-19 0 -3.2160474130996267e-16 -1.6913553890773874e-16 0.99999999999999978 0
		 -1.6229485642588841 -18.967071025981095 -6.6708698147115174e-16 1;
	setAttr ".pm[9]" -type "matrix" 1 3.3268111967235886e-16 3.7524436680848346e-16 0
		 -2.7246323797133394e-16 1 8.6736173798839045e-19 0 -3.2160474130996267e-16 -1.6913553890773874e-16 0.99999999999999978 0
		 -0.90967526306293423 -20.342669535430424 -3.7287275910078236e-16 1;
	setAttr ".pm[10]" -type "matrix" 1 3.3268111967235886e-16 3.7524436680848346e-16 0
		 -2.7246323797133394e-16 1 8.6736173798839045e-19 0 -3.2160474130996267e-16 -1.6913553890773874e-16 0.99999999999999978 0
		 0.84293913416139965 -20.35285915401894 2.9865487036762086e-16 1;
	setAttr ".gm" -type "matrix" 1 0 0 0 0 1 0 0 0 0 1 0 0 0 -4.3639740943908691 1;
	setAttr -s 11 ".ma";
	setAttr -s 11 ".dpf[0:10]"  4 4 4 4 4 4 4 4 4 4 4;
	setAttr -s 11 ".lw";
	setAttr -s 11 ".lw";
	setAttr ".mmi" yes;
	setAttr ".mi" 3;
	setAttr ".ucm" yes;
	setAttr -s 11 ".ifcl";
	setAttr -s 11 ".ifcl";
createNode dagPose -n "bindPose2";
	rename -uid "727069C3-4FC8-2022-C1F5-329A8A0B86D0";
	setAttr -s 12 ".wm";
	setAttr ".wm[0]" -type "matrix" 1 0 0 0 0 1 0 0 0 0 1 0 0 0 -4.3639740943908691 1;
	setAttr -s 12 ".xm";
	setAttr ".xm[0]" -type "matrix" "xform" 1 1 1 0 0 0 0 0 0 -4.3639740943908691 0
		 0 0 0 14.025846641441378 4.3639740943908691 0 0 0 0 14.025846641441378 4.3639740943908691 0
		 0 0 0 0 0 1 0 0 0 1 1 1 1 yes;
	setAttr ".xm[1]" -type "matrix" "xform" 1 1 1 0 0 0 0 5.9164567891575885e-31
		 13.245091962048427 4.3639739097543577 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 -0.49751871702489225 0.50246903010026944 -0.49751871702489203 0.50246903010026922 1
		 1 1 yes;
	setAttr ".xm[2]" -type "matrix" "xform" 1 1 1 0 0 -1.0271297701258675e-14 0 3.1296534325964274
		 0.0013571822687779567 7.3158830311461606e-16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 
		0 0 -0.0049503130753721083 0.99998774712516147 1 1 1 yes;
	setAttr ".xm[3]" -type "matrix" "xform" 1 1 1 0 0 -1.021405182655144e-14 0 3.0078306177888585
		 -3.0399294193017568e-14 6.6630553823817362e-16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 
		0 0 0 1 1 1 1 yes;
	setAttr ".xm[4]" -type "matrix" "xform" 1 1 1 5.5511151231257827e-17 5.5511151231257839e-17
		 -1.6653345369377351e-16 0 1.0108324850546166 -9.540979117872439e-15 1.8753699034622123e-16 0
		 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0.49999999999999756 -0.50000000000000255 0.49999999999999739 0.50000000000000266 1
		 1 1 yes;
	setAttr ".xm[5]" -type "matrix" "xform" 1 1 1 9.9573185659611003e-17 -1.7299790466162248e-18
		 -2.8796409701214988e-16 0 -5.6916394003166673 0.088696715267991222 -5.2837826770392245e-16 0
		 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 -0.99996964866276661 0.0077911329896995828 -4.7706930387834716e-19 6.1230481473968025e-17 1
		 1 1 yes;
	setAttr ".xm[6]" -type "matrix" "xform" 1 1 1 1.1452247734072623e-17 3.3103046310011529e-18
		 -6.9388939039072268e-18 0 -2.5568157406708849 0.030495820408724325 1.4166914444946374e-15 0
		 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0.99998221928093034 -0.0059633146810638442 -1.6892695642241232e-18 2.8327190801462309e-16 1
		 1 1 yes;
	setAttr ".xm[7]" -type "matrix" "xform" 1 1 1 0 0 0 0 -0.74576527765980671 0.0870873132134172
		 7.3415527653087012e-16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0.49843632932941978 -0.50155879576039153 0.49843632932941939 0.50155879576039197 1
		 1 1 yes;
	setAttr ".xm[8]" -type "matrix" "xform" 1 1 1 0 0 0 0 -0.049935142666281962
		 0.032626693797798409 1.6071605282999104 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 -0.49857754500408186 0.5014184197032483 0.49857754500408169 0.50141841970324841 1
		 1 1 yes;
	setAttr ".xm[9]" -type "matrix" "xform" 1 1 1 5.5511151231257839e-17 -5.5511151231257827e-17
		 -1.6653345369377351e-16 0 -0.029556234433329109 0.032510904546475788 -1.6229485642588899 0
		 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 -0.49857754500408186 0.5014184197032483 0.49857754500408169 0.50141841970324841 1
		 1 1 yes;
	setAttr ".xm[10]" -type "matrix" "xform" 1 1 1 -2.2204460492503126e-16 -5.5511151231257837e-16
		 -3.3306690738754696e-16 0 -1.4051325401571297 0.040326679010822555 -0.90967526306294033 0
		 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 -0.49857754500408186 0.5014184197032483 0.49857754500408169 0.50141841970324841 1
		 1 1 yes;
	setAttr ".xm[11]" -type "matrix" "xform" 1 1 1 -1.110223024625157e-16 -3.3306690738754701e-16
		 1.110223024625157e-16 0 -1.4153219942736044 0.040384573636483817 0.84293913416139354 0
		 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 -0.49857754500408186 0.5014184197032483 0.49857754500408169 0.50141841970324841 1
		 1 1 yes;
	setAttr -s 12 ".m";
	setAttr -s 12 ".p";
	setAttr -s 12 ".g[0:11]" yes no no no no no no no no no no no;
	setAttr ".bp" yes;
createNode aiOptions -s -n "defaultArnoldRenderOptions";
	rename -uid "943214AC-4A2A-0B40-79F2-338B941F17A3";
	setAttr ".version" -type "string" "5.0.0.1";
createNode aiAOVFilter -s -n "defaultArnoldFilter";
	rename -uid "B324E3B7-4F95-AFFC-B940-35A9E45DCEB2";
	setAttr ".ai_translator" -type "string" "gaussian";
createNode aiAOVDriver -s -n "defaultArnoldDriver";
	rename -uid "679E9245-4CDB-2F50-66B9-658A88BBACED";
	setAttr ".ai_translator" -type "string" "exr";
createNode aiAOVDriver -s -n "defaultArnoldDisplayDriver";
	rename -uid "BE4E7E76-4AC7-1850-FCC3-A8B2C3CAD3EA";
	setAttr ".output_mode" 0;
	setAttr ".ai_translator" -type "string" "maya";
select -ne :time1;
	setAttr ".o" 1;
	setAttr ".unw" 1;
select -ne :hardwareRenderingGlobals;
	setAttr ".otfna" -type "stringArray" 22 "NURBS Curves" "NURBS Surfaces" "Polygons" "Subdiv Surface" "Particles" "Particle Instance" "Fluids" "Strokes" "Image Planes" "UI" "Lights" "Cameras" "Locators" "Joints" "IK Handles" "Deformers" "Motion Trails" "Components" "Hair Systems" "Follicles" "Misc. UI" "Ornaments"  ;
	setAttr ".otfva" -type "Int32Array" 22 0 1 1 1 1 1
		 1 1 1 0 0 0 0 0 0 0 0 0
		 0 0 0 0 ;
	setAttr ".fprt" yes;
select -ne :renderPartition;
	setAttr -s 3 ".st";
select -ne :renderGlobalsList1;
select -ne :defaultShaderList1;
	setAttr -s 6 ".s";
select -ne :postProcessList1;
	setAttr -s 2 ".p";
select -ne :defaultRenderUtilityList1;
select -ne :defaultRenderingList1;
select -ne :defaultTextureList1;
select -ne :initialShadingGroup;
	setAttr ".ro" yes;
select -ne :initialParticleSE;
	setAttr ".ro" yes;
select -ne :defaultRenderGlobals;
	addAttr -ci true -h true -sn "dss" -ln "defaultSurfaceShader" -dt "string";
	setAttr ".ren" -type "string" "arnold";
	setAttr ".outf" 51;
	setAttr ".imfkey" -type "string" "exr";
	setAttr ".dss" -type "string" "lambert1";
select -ne :defaultResolution;
	setAttr ".pa" 1;
select -ne :defaultColorMgtGlobals;
	setAttr ".cfe" yes;
	setAttr ".cfp" -type "string" "<MAYA_RESOURCES>/OCIO-configs/Maya2022-default/config.ocio";
	setAttr ".vtn" -type "string" "ACES 1.0 SDR-video (sRGB)";
	setAttr ".vn" -type "string" "ACES 1.0 SDR-video";
	setAttr ".dn" -type "string" "sRGB";
	setAttr ".wsn" -type "string" "ACEScg";
	setAttr ".ovt" no;
	setAttr ".povt" no;
	setAttr ".otn" -type "string" "ACES 1.0 SDR-video (sRGB)";
	setAttr ".potn" -type "string" "ACES 1.0 SDR-video (sRGB)";
select -ne :hardwareRenderGlobals;
	setAttr ".ctrs" 256;
	setAttr ".btrs" 512;
connectAttr "Apron_03_scaleConstraint1.csx" "Apron_03.sx";
connectAttr "Apron_03_scaleConstraint1.csy" "Apron_03.sy";
connectAttr "Apron_03_scaleConstraint1.csz" "Apron_03.sz";
connectAttr "Apron_03_parentConstraint1.ctx" "Apron_03.tx";
connectAttr "Apron_03_parentConstraint1.cty" "Apron_03.ty";
connectAttr "Apron_03_parentConstraint1.ctz" "Apron_03.tz";
connectAttr "Apron_03_parentConstraint1.crx" "Apron_03.rx";
connectAttr "Apron_03_parentConstraint1.cry" "Apron_03.ry";
connectAttr "Apron_03_parentConstraint1.crz" "Apron_03.rz";
connectAttr "Apron_03.s" "Apron_04.is";
connectAttr "Apron_04_scaleConstraint1.csx" "Apron_04.sx";
connectAttr "Apron_04_scaleConstraint1.csy" "Apron_04.sy";
connectAttr "Apron_04_scaleConstraint1.csz" "Apron_04.sz";
connectAttr "Apron_04_parentConstraint1.ctx" "Apron_04.tx";
connectAttr "Apron_04_parentConstraint1.cty" "Apron_04.ty";
connectAttr "Apron_04_parentConstraint1.ctz" "Apron_04.tz";
connectAttr "Apron_04_parentConstraint1.crx" "Apron_04.rx";
connectAttr "Apron_04_parentConstraint1.cry" "Apron_04.ry";
connectAttr "Apron_04_parentConstraint1.crz" "Apron_04.rz";
connectAttr "Apron_04.s" "Apron_05.is";
connectAttr "Apron_05_scaleConstraint1.csx" "Apron_05.sx";
connectAttr "Apron_05_scaleConstraint1.csy" "Apron_05.sy";
connectAttr "Apron_05_scaleConstraint1.csz" "Apron_05.sz";
connectAttr "Apron_05_parentConstraint1.ctx" "Apron_05.tx";
connectAttr "Apron_05_parentConstraint1.cty" "Apron_05.ty";
connectAttr "Apron_05_parentConstraint1.ctz" "Apron_05.tz";
connectAttr "Apron_05_parentConstraint1.crx" "Apron_05.rx";
connectAttr "Apron_05_parentConstraint1.cry" "Apron_05.ry";
connectAttr "Apron_05_parentConstraint1.crz" "Apron_05.rz";
connectAttr "Apron_05.s" "Apron_06.is";
connectAttr "Apron_05.ro" "Apron_05_parentConstraint1.cro";
connectAttr "Apron_05.pim" "Apron_05_parentConstraint1.cpim";
connectAttr "Apron_05.rp" "Apron_05_parentConstraint1.crp";
connectAttr "Apron_05.rpt" "Apron_05_parentConstraint1.crt";
connectAttr "Apron_05.jo" "Apron_05_parentConstraint1.cjo";
connectAttr "|apron_rig|apron_placer_ctrl|apron_base_offset|apron_base|apron_04_offset|apron_04|apron_05_offset|apron_05_offset.t" "Apron_05_parentConstraint1.tg[0].tt"
		;
connectAttr "|apron_rig|apron_placer_ctrl|apron_base_offset|apron_base|apron_04_offset|apron_04|apron_05_offset|apron_05_offset.rp" "Apron_05_parentConstraint1.tg[0].trp"
		;
connectAttr "|apron_rig|apron_placer_ctrl|apron_base_offset|apron_base|apron_04_offset|apron_04|apron_05_offset|apron_05_offset.rpt" "Apron_05_parentConstraint1.tg[0].trt"
		;
connectAttr "|apron_rig|apron_placer_ctrl|apron_base_offset|apron_base|apron_04_offset|apron_04|apron_05_offset|apron_05_offset.r" "Apron_05_parentConstraint1.tg[0].tr"
		;
connectAttr "|apron_rig|apron_placer_ctrl|apron_base_offset|apron_base|apron_04_offset|apron_04|apron_05_offset|apron_05_offset.ro" "Apron_05_parentConstraint1.tg[0].tro"
		;
connectAttr "|apron_rig|apron_placer_ctrl|apron_base_offset|apron_base|apron_04_offset|apron_04|apron_05_offset|apron_05_offset.s" "Apron_05_parentConstraint1.tg[0].ts"
		;
connectAttr "|apron_rig|apron_placer_ctrl|apron_base_offset|apron_base|apron_04_offset|apron_04|apron_05_offset|apron_05_offset.pm" "Apron_05_parentConstraint1.tg[0].tpm"
		;
connectAttr "Apron_05_parentConstraint1.w0" "Apron_05_parentConstraint1.tg[0].tw"
		;
connectAttr "Apron_05.ssc" "Apron_05_scaleConstraint1.tsc";
connectAttr "Apron_05.pim" "Apron_05_scaleConstraint1.cpim";
connectAttr "|apron_rig|apron_placer_ctrl|apron_base_offset|apron_base|apron_04_offset|apron_04|apron_05_offset|apron_05_offset.s" "Apron_05_scaleConstraint1.tg[0].ts"
		;
connectAttr "|apron_rig|apron_placer_ctrl|apron_base_offset|apron_base|apron_04_offset|apron_04|apron_05_offset|apron_05_offset.pm" "Apron_05_scaleConstraint1.tg[0].tpm"
		;
connectAttr "Apron_05_scaleConstraint1.w0" "Apron_05_scaleConstraint1.tg[0].tw";
connectAttr "Apron_04.ro" "Apron_04_parentConstraint1.cro";
connectAttr "Apron_04.pim" "Apron_04_parentConstraint1.cpim";
connectAttr "Apron_04.rp" "Apron_04_parentConstraint1.crp";
connectAttr "Apron_04.rpt" "Apron_04_parentConstraint1.crt";
connectAttr "Apron_04.jo" "Apron_04_parentConstraint1.cjo";
connectAttr "apron_04.t" "Apron_04_parentConstraint1.tg[0].tt";
connectAttr "apron_04.rp" "Apron_04_parentConstraint1.tg[0].trp";
connectAttr "apron_04.rpt" "Apron_04_parentConstraint1.tg[0].trt";
connectAttr "apron_04.r" "Apron_04_parentConstraint1.tg[0].tr";
connectAttr "apron_04.ro" "Apron_04_parentConstraint1.tg[0].tro";
connectAttr "apron_04.s" "Apron_04_parentConstraint1.tg[0].ts";
connectAttr "apron_04.pm" "Apron_04_parentConstraint1.tg[0].tpm";
connectAttr "Apron_04_parentConstraint1.w0" "Apron_04_parentConstraint1.tg[0].tw"
		;
connectAttr "Apron_04.ssc" "Apron_04_scaleConstraint1.tsc";
connectAttr "Apron_04.pim" "Apron_04_scaleConstraint1.cpim";
connectAttr "apron_04.s" "Apron_04_scaleConstraint1.tg[0].ts";
connectAttr "apron_04.pm" "Apron_04_scaleConstraint1.tg[0].tpm";
connectAttr "Apron_04_scaleConstraint1.w0" "Apron_04_scaleConstraint1.tg[0].tw";
connectAttr "Apron_03.s" "Apron_02.is";
connectAttr "Apron_02_scaleConstraint1.csx" "Apron_02.sx";
connectAttr "Apron_02_scaleConstraint1.csy" "Apron_02.sy";
connectAttr "Apron_02_scaleConstraint1.csz" "Apron_02.sz";
connectAttr "Apron_02_parentConstraint1.ctx" "Apron_02.tx";
connectAttr "Apron_02_parentConstraint1.cty" "Apron_02.ty";
connectAttr "Apron_02_parentConstraint1.ctz" "Apron_02.tz";
connectAttr "Apron_02_parentConstraint1.crx" "Apron_02.rx";
connectAttr "Apron_02_parentConstraint1.cry" "Apron_02.ry";
connectAttr "Apron_02_parentConstraint1.crz" "Apron_02.rz";
connectAttr "Apron_02.s" "Apron_01.is";
connectAttr "Apron_01_scaleConstraint1.csx" "Apron_01.sx";
connectAttr "Apron_01_scaleConstraint1.csy" "Apron_01.sy";
connectAttr "Apron_01_scaleConstraint1.csz" "Apron_01.sz";
connectAttr "Apron_01_parentConstraint1.ctx" "Apron_01.tx";
connectAttr "Apron_01_parentConstraint1.cty" "Apron_01.ty";
connectAttr "Apron_01_parentConstraint1.ctz" "Apron_01.tz";
connectAttr "Apron_01_parentConstraint1.crx" "Apron_01.rx";
connectAttr "Apron_01_parentConstraint1.cry" "Apron_01.ry";
connectAttr "Apron_01_parentConstraint1.crz" "Apron_01.rz";
connectAttr "Apron_01.s" "Apron_07.is";
connectAttr "Apron_01.ro" "Apron_01_parentConstraint1.cro";
connectAttr "Apron_01.pim" "Apron_01_parentConstraint1.cpim";
connectAttr "Apron_01.rp" "Apron_01_parentConstraint1.crp";
connectAttr "Apron_01.rpt" "Apron_01_parentConstraint1.crt";
connectAttr "Apron_01.jo" "Apron_01_parentConstraint1.cjo";
connectAttr "apron_03.t" "Apron_01_parentConstraint1.tg[0].tt";
connectAttr "apron_03.rp" "Apron_01_parentConstraint1.tg[0].trp";
connectAttr "apron_03.rpt" "Apron_01_parentConstraint1.tg[0].trt";
connectAttr "apron_03.r" "Apron_01_parentConstraint1.tg[0].tr";
connectAttr "apron_03.ro" "Apron_01_parentConstraint1.tg[0].tro";
connectAttr "apron_03.s" "Apron_01_parentConstraint1.tg[0].ts";
connectAttr "apron_03.pm" "Apron_01_parentConstraint1.tg[0].tpm";
connectAttr "Apron_01_parentConstraint1.w0" "Apron_01_parentConstraint1.tg[0].tw"
		;
connectAttr "Apron_01.ssc" "Apron_01_scaleConstraint1.tsc";
connectAttr "Apron_01.pim" "Apron_01_scaleConstraint1.cpim";
connectAttr "apron_03.s" "Apron_01_scaleConstraint1.tg[0].ts";
connectAttr "apron_03.pm" "Apron_01_scaleConstraint1.tg[0].tpm";
connectAttr "Apron_01_scaleConstraint1.w0" "Apron_01_scaleConstraint1.tg[0].tw";
connectAttr "Apron_02.ro" "Apron_02_parentConstraint1.cro";
connectAttr "Apron_02.pim" "Apron_02_parentConstraint1.cpim";
connectAttr "Apron_02.rp" "Apron_02_parentConstraint1.crp";
connectAttr "Apron_02.rpt" "Apron_02_parentConstraint1.crt";
connectAttr "Apron_02.jo" "Apron_02_parentConstraint1.cjo";
connectAttr "apron_02.t" "Apron_02_parentConstraint1.tg[0].tt";
connectAttr "apron_02.rp" "Apron_02_parentConstraint1.tg[0].trp";
connectAttr "apron_02.rpt" "Apron_02_parentConstraint1.tg[0].trt";
connectAttr "apron_02.r" "Apron_02_parentConstraint1.tg[0].tr";
connectAttr "apron_02.ro" "Apron_02_parentConstraint1.tg[0].tro";
connectAttr "apron_02.s" "Apron_02_parentConstraint1.tg[0].ts";
connectAttr "apron_02.pm" "Apron_02_parentConstraint1.tg[0].tpm";
connectAttr "Apron_02_parentConstraint1.w0" "Apron_02_parentConstraint1.tg[0].tw"
		;
connectAttr "Apron_02.ssc" "Apron_02_scaleConstraint1.tsc";
connectAttr "Apron_02.pim" "Apron_02_scaleConstraint1.cpim";
connectAttr "apron_02.s" "Apron_02_scaleConstraint1.tg[0].ts";
connectAttr "apron_02.pm" "Apron_02_scaleConstraint1.tg[0].tpm";
connectAttr "Apron_02_scaleConstraint1.w0" "Apron_02_scaleConstraint1.tg[0].tw";
connectAttr "Apron_02.s" "Aproncollar_R.is";
connectAttr "Aproncollar_R_parentConstraint1.ctx" "Aproncollar_R.tx";
connectAttr "Aproncollar_R_parentConstraint1.cty" "Aproncollar_R.ty";
connectAttr "Aproncollar_R_parentConstraint1.ctz" "Aproncollar_R.tz";
connectAttr "Aproncollar_R_parentConstraint1.crx" "Aproncollar_R.rx";
connectAttr "Aproncollar_R_parentConstraint1.cry" "Aproncollar_R.ry";
connectAttr "Aproncollar_R_parentConstraint1.crz" "Aproncollar_R.rz";
connectAttr "Aproncollar_R_scaleConstraint1.csx" "Aproncollar_R.sx";
connectAttr "Aproncollar_R_scaleConstraint1.csy" "Aproncollar_R.sy";
connectAttr "Aproncollar_R_scaleConstraint1.csz" "Aproncollar_R.sz";
connectAttr "Aproncollar_R.ro" "Aproncollar_R_parentConstraint1.cro";
connectAttr "Aproncollar_R.pim" "Aproncollar_R_parentConstraint1.cpim";
connectAttr "Aproncollar_R.rp" "Aproncollar_R_parentConstraint1.crp";
connectAttr "Aproncollar_R.rpt" "Aproncollar_R_parentConstraint1.crt";
connectAttr "Aproncollar_R.jo" "Aproncollar_R_parentConstraint1.cjo";
connectAttr "apron_r_collar.t" "Aproncollar_R_parentConstraint1.tg[0].tt";
connectAttr "apron_r_collar.rp" "Aproncollar_R_parentConstraint1.tg[0].trp";
connectAttr "apron_r_collar.rpt" "Aproncollar_R_parentConstraint1.tg[0].trt";
connectAttr "apron_r_collar.r" "Aproncollar_R_parentConstraint1.tg[0].tr";
connectAttr "apron_r_collar.ro" "Aproncollar_R_parentConstraint1.tg[0].tro";
connectAttr "apron_r_collar.s" "Aproncollar_R_parentConstraint1.tg[0].ts";
connectAttr "apron_r_collar.pm" "Aproncollar_R_parentConstraint1.tg[0].tpm";
connectAttr "Aproncollar_R_parentConstraint1.w0" "Aproncollar_R_parentConstraint1.tg[0].tw"
		;
connectAttr "Aproncollar_R.ssc" "Aproncollar_R_scaleConstraint1.tsc";
connectAttr "Aproncollar_R.pim" "Aproncollar_R_scaleConstraint1.cpim";
connectAttr "apron_r_collar.s" "Aproncollar_R_scaleConstraint1.tg[0].ts";
connectAttr "apron_r_collar.pm" "Aproncollar_R_scaleConstraint1.tg[0].tpm";
connectAttr "Aproncollar_R_scaleConstraint1.w0" "Aproncollar_R_scaleConstraint1.tg[0].tw"
		;
connectAttr "Apron_02.s" "Aproncollar_L.is";
connectAttr "Aproncollar_L_parentConstraint1.ctx" "Aproncollar_L.tx";
connectAttr "Aproncollar_L_parentConstraint1.cty" "Aproncollar_L.ty";
connectAttr "Aproncollar_L_parentConstraint1.ctz" "Aproncollar_L.tz";
connectAttr "Aproncollar_L_parentConstraint1.crx" "Aproncollar_L.rx";
connectAttr "Aproncollar_L_parentConstraint1.cry" "Aproncollar_L.ry";
connectAttr "Aproncollar_L_parentConstraint1.crz" "Aproncollar_L.rz";
connectAttr "Aproncollar_L_scaleConstraint1.csx" "Aproncollar_L.sx";
connectAttr "Aproncollar_L_scaleConstraint1.csy" "Aproncollar_L.sy";
connectAttr "Aproncollar_L_scaleConstraint1.csz" "Aproncollar_L.sz";
connectAttr "Aproncollar_L.ro" "Aproncollar_L_parentConstraint1.cro";
connectAttr "Aproncollar_L.pim" "Aproncollar_L_parentConstraint1.cpim";
connectAttr "Aproncollar_L.rp" "Aproncollar_L_parentConstraint1.crp";
connectAttr "Aproncollar_L.rpt" "Aproncollar_L_parentConstraint1.crt";
connectAttr "Aproncollar_L.jo" "Aproncollar_L_parentConstraint1.cjo";
connectAttr "apron_l_collar.t" "Aproncollar_L_parentConstraint1.tg[0].tt";
connectAttr "apron_l_collar.rp" "Aproncollar_L_parentConstraint1.tg[0].trp";
connectAttr "apron_l_collar.rpt" "Aproncollar_L_parentConstraint1.tg[0].trt";
connectAttr "apron_l_collar.r" "Aproncollar_L_parentConstraint1.tg[0].tr";
connectAttr "apron_l_collar.ro" "Aproncollar_L_parentConstraint1.tg[0].tro";
connectAttr "apron_l_collar.s" "Aproncollar_L_parentConstraint1.tg[0].ts";
connectAttr "apron_l_collar.pm" "Aproncollar_L_parentConstraint1.tg[0].tpm";
connectAttr "Aproncollar_L_parentConstraint1.w0" "Aproncollar_L_parentConstraint1.tg[0].tw"
		;
connectAttr "Aproncollar_L.ssc" "Aproncollar_L_scaleConstraint1.tsc";
connectAttr "Aproncollar_L.pim" "Aproncollar_L_scaleConstraint1.cpim";
connectAttr "apron_l_collar.s" "Aproncollar_L_scaleConstraint1.tg[0].ts";
connectAttr "apron_l_collar.pm" "Aproncollar_L_scaleConstraint1.tg[0].tpm";
connectAttr "Aproncollar_L_scaleConstraint1.w0" "Aproncollar_L_scaleConstraint1.tg[0].tw"
		;
connectAttr "Apron_02.s" "Aproncollar_L_sub.is";
connectAttr "Aproncollar_L_sub_parentConstraint1.ctx" "Aproncollar_L_sub.tx";
connectAttr "Aproncollar_L_sub_parentConstraint1.cty" "Aproncollar_L_sub.ty";
connectAttr "Aproncollar_L_sub_parentConstraint1.ctz" "Aproncollar_L_sub.tz";
connectAttr "Aproncollar_L_sub_parentConstraint1.crx" "Aproncollar_L_sub.rx";
connectAttr "Aproncollar_L_sub_parentConstraint1.cry" "Aproncollar_L_sub.ry";
connectAttr "Aproncollar_L_sub_parentConstraint1.crz" "Aproncollar_L_sub.rz";
connectAttr "Aproncollar_L_sub_scaleConstraint1.csx" "Aproncollar_L_sub.sx";
connectAttr "Aproncollar_L_sub_scaleConstraint1.csy" "Aproncollar_L_sub.sy";
connectAttr "Aproncollar_L_sub_scaleConstraint1.csz" "Aproncollar_L_sub.sz";
connectAttr "Aproncollar_L_sub.ro" "Aproncollar_L_sub_parentConstraint1.cro";
connectAttr "Aproncollar_L_sub.pim" "Aproncollar_L_sub_parentConstraint1.cpim";
connectAttr "Aproncollar_L_sub.rp" "Aproncollar_L_sub_parentConstraint1.crp";
connectAttr "Aproncollar_L_sub.rpt" "Aproncollar_L_sub_parentConstraint1.crt";
connectAttr "Aproncollar_L_sub.jo" "Aproncollar_L_sub_parentConstraint1.cjo";
connectAttr "apron_l_collarsub.t" "Aproncollar_L_sub_parentConstraint1.tg[0].tt"
		;
connectAttr "apron_l_collarsub.rp" "Aproncollar_L_sub_parentConstraint1.tg[0].trp"
		;
connectAttr "apron_l_collarsub.rpt" "Aproncollar_L_sub_parentConstraint1.tg[0].trt"
		;
connectAttr "apron_l_collarsub.r" "Aproncollar_L_sub_parentConstraint1.tg[0].tr"
		;
connectAttr "apron_l_collarsub.ro" "Aproncollar_L_sub_parentConstraint1.tg[0].tro"
		;
connectAttr "apron_l_collarsub.s" "Aproncollar_L_sub_parentConstraint1.tg[0].ts"
		;
connectAttr "apron_l_collarsub.pm" "Aproncollar_L_sub_parentConstraint1.tg[0].tpm"
		;
connectAttr "Aproncollar_L_sub_parentConstraint1.w0" "Aproncollar_L_sub_parentConstraint1.tg[0].tw"
		;
connectAttr "Aproncollar_L_sub.ssc" "Aproncollar_L_sub_scaleConstraint1.tsc";
connectAttr "Aproncollar_L_sub.pim" "Aproncollar_L_sub_scaleConstraint1.cpim";
connectAttr "apron_l_collarsub.s" "Aproncollar_L_sub_scaleConstraint1.tg[0].ts";
connectAttr "apron_l_collarsub.pm" "Aproncollar_L_sub_scaleConstraint1.tg[0].tpm"
		;
connectAttr "Aproncollar_L_sub_scaleConstraint1.w0" "Aproncollar_L_sub_scaleConstraint1.tg[0].tw"
		;
connectAttr "Aproncollar_R_sub_scaleConstraint1.csx" "Aproncollar_R_sub.sx";
connectAttr "Aproncollar_R_sub_scaleConstraint1.csy" "Aproncollar_R_sub.sy";
connectAttr "Aproncollar_R_sub_scaleConstraint1.csz" "Aproncollar_R_sub.sz";
connectAttr "Apron_02.s" "Aproncollar_R_sub.is";
connectAttr "Aproncollar_R_sub_parentConstraint1.ctx" "Aproncollar_R_sub.tx";
connectAttr "Aproncollar_R_sub_parentConstraint1.cty" "Aproncollar_R_sub.ty";
connectAttr "Aproncollar_R_sub_parentConstraint1.ctz" "Aproncollar_R_sub.tz";
connectAttr "Aproncollar_R_sub_parentConstraint1.crx" "Aproncollar_R_sub.rx";
connectAttr "Aproncollar_R_sub_parentConstraint1.cry" "Aproncollar_R_sub.ry";
connectAttr "Aproncollar_R_sub_parentConstraint1.crz" "Aproncollar_R_sub.rz";
connectAttr "Aproncollar_R_sub.ro" "Aproncollar_R_sub_parentConstraint1.cro";
connectAttr "Aproncollar_R_sub.pim" "Aproncollar_R_sub_parentConstraint1.cpim";
connectAttr "Aproncollar_R_sub.rp" "Aproncollar_R_sub_parentConstraint1.crp";
connectAttr "Aproncollar_R_sub.rpt" "Aproncollar_R_sub_parentConstraint1.crt";
connectAttr "Aproncollar_R_sub.jo" "Aproncollar_R_sub_parentConstraint1.cjo";
connectAttr "apron_r_collarsub.t" "Aproncollar_R_sub_parentConstraint1.tg[0].tt"
		;
connectAttr "apron_r_collarsub.rp" "Aproncollar_R_sub_parentConstraint1.tg[0].trp"
		;
connectAttr "apron_r_collarsub.rpt" "Aproncollar_R_sub_parentConstraint1.tg[0].trt"
		;
connectAttr "apron_r_collarsub.r" "Aproncollar_R_sub_parentConstraint1.tg[0].tr"
		;
connectAttr "apron_r_collarsub.ro" "Aproncollar_R_sub_parentConstraint1.tg[0].tro"
		;
connectAttr "apron_r_collarsub.s" "Aproncollar_R_sub_parentConstraint1.tg[0].ts"
		;
connectAttr "apron_r_collarsub.pm" "Aproncollar_R_sub_parentConstraint1.tg[0].tpm"
		;
connectAttr "Aproncollar_R_sub_parentConstraint1.w0" "Aproncollar_R_sub_parentConstraint1.tg[0].tw"
		;
connectAttr "Aproncollar_R_sub.ssc" "Aproncollar_R_sub_scaleConstraint1.tsc";
connectAttr "Aproncollar_R_sub.pim" "Aproncollar_R_sub_scaleConstraint1.cpim";
connectAttr "apron_r_collarsub.s" "Aproncollar_R_sub_scaleConstraint1.tg[0].ts";
connectAttr "apron_r_collarsub.pm" "Aproncollar_R_sub_scaleConstraint1.tg[0].tpm"
		;
connectAttr "Aproncollar_R_sub_scaleConstraint1.w0" "Aproncollar_R_sub_scaleConstraint1.tg[0].tw"
		;
connectAttr "Apron_03.ro" "Apron_03_parentConstraint1.cro";
connectAttr "Apron_03.pim" "Apron_03_parentConstraint1.cpim";
connectAttr "Apron_03.rp" "Apron_03_parentConstraint1.crp";
connectAttr "Apron_03.rpt" "Apron_03_parentConstraint1.crt";
connectAttr "Apron_03.jo" "Apron_03_parentConstraint1.cjo";
connectAttr "apron_01.t" "Apron_03_parentConstraint1.tg[0].tt";
connectAttr "apron_01.rp" "Apron_03_parentConstraint1.tg[0].trp";
connectAttr "apron_01.rpt" "Apron_03_parentConstraint1.tg[0].trt";
connectAttr "apron_01.r" "Apron_03_parentConstraint1.tg[0].tr";
connectAttr "apron_01.ro" "Apron_03_parentConstraint1.tg[0].tro";
connectAttr "apron_01.s" "Apron_03_parentConstraint1.tg[0].ts";
connectAttr "apron_01.pm" "Apron_03_parentConstraint1.tg[0].tpm";
connectAttr "Apron_03_parentConstraint1.w0" "Apron_03_parentConstraint1.tg[0].tw"
		;
connectAttr "Apron_03.pim" "Apron_03_scaleConstraint1.cpim";
connectAttr "apron_01.s" "Apron_03_scaleConstraint1.tg[0].ts";
connectAttr "apron_01.pm" "Apron_03_scaleConstraint1.tg[0].tpm";
connectAttr "Apron_03_scaleConstraint1.w0" "Apron_03_scaleConstraint1.tg[0].tw";
connectAttr "skinCluster1.og[0]" "apron_meshShape.i";
relationship "link" ":lightLinker1" ":initialShadingGroup.message" ":defaultLightSet.message";
relationship "link" ":lightLinker1" ":initialParticleSE.message" ":defaultLightSet.message";
relationship "link" ":lightLinker1" "lambert2SG.message" ":defaultLightSet.message";
relationship "shadowLink" ":lightLinker1" ":initialShadingGroup.message" ":defaultLightSet.message";
relationship "shadowLink" ":lightLinker1" ":initialParticleSE.message" ":defaultLightSet.message";
relationship "shadowLink" ":lightLinker1" "lambert2SG.message" ":defaultLightSet.message";
connectAttr "layerManager.dli[0]" "defaultLayer.id";
connectAttr "renderLayerManager.rlmi[0]" "defaultRenderLayer.rlid";
connectAttr "sharedReferenceNode.sr" "MauriceRig_v01RN.sr";
connectAttr "file1.oc" "apron_shd.c";
connectAttr "apron_shd.oc" "lambert2SG.ss";
connectAttr "apron_meshShape.iog" "lambert2SG.dsm" -na;
connectAttr "lambert2SG.msg" "materialInfo1.sg";
connectAttr "apron_shd.msg" "materialInfo1.m";
connectAttr "file1.msg" "materialInfo1.t" -na;
connectAttr ":defaultColorMgtGlobals.cme" "file1.cme";
connectAttr ":defaultColorMgtGlobals.cfe" "file1.cmcf";
connectAttr ":defaultColorMgtGlobals.cfp" "file1.cmcp";
connectAttr ":defaultColorMgtGlobals.wsn" "file1.ws";
connectAttr "place2dTexture1.c" "file1.c";
connectAttr "place2dTexture1.tf" "file1.tf";
connectAttr "place2dTexture1.rf" "file1.rf";
connectAttr "place2dTexture1.mu" "file1.mu";
connectAttr "place2dTexture1.mv" "file1.mv";
connectAttr "place2dTexture1.s" "file1.s";
connectAttr "place2dTexture1.wu" "file1.wu";
connectAttr "place2dTexture1.wv" "file1.wv";
connectAttr "place2dTexture1.re" "file1.re";
connectAttr "place2dTexture1.of" "file1.of";
connectAttr "place2dTexture1.r" "file1.ro";
connectAttr "place2dTexture1.n" "file1.n";
connectAttr "place2dTexture1.vt1" "file1.vt1";
connectAttr "place2dTexture1.vt2" "file1.vt2";
connectAttr "place2dTexture1.vt3" "file1.vt3";
connectAttr "place2dTexture1.vc1" "file1.vc1";
connectAttr "place2dTexture1.o" "file1.uv";
connectAttr "place2dTexture1.ofs" "file1.fs";
connectAttr "apron_meshShapeOrig.w" "skinCluster1.ip[0].ig";
connectAttr "apron_meshShapeOrig.o" "skinCluster1.orggeom[0]";
connectAttr "bindPose2.msg" "skinCluster1.bp";
connectAttr "Apron_03.wm" "skinCluster1.ma[0]";
connectAttr "Apron_04.wm" "skinCluster1.ma[1]";
connectAttr "Apron_05.wm" "skinCluster1.ma[2]";
connectAttr "Apron_06.wm" "skinCluster1.ma[3]";
connectAttr "Apron_02.wm" "skinCluster1.ma[4]";
connectAttr "Apron_01.wm" "skinCluster1.ma[5]";
connectAttr "Apron_07.wm" "skinCluster1.ma[6]";
connectAttr "Aproncollar_R.wm" "skinCluster1.ma[7]";
connectAttr "Aproncollar_L.wm" "skinCluster1.ma[8]";
connectAttr "Aproncollar_L_sub.wm" "skinCluster1.ma[9]";
connectAttr "Aproncollar_R_sub.wm" "skinCluster1.ma[10]";
connectAttr "Apron_03.liw" "skinCluster1.lw[0]";
connectAttr "Apron_04.liw" "skinCluster1.lw[1]";
connectAttr "Apron_05.liw" "skinCluster1.lw[2]";
connectAttr "Apron_06.liw" "skinCluster1.lw[3]";
connectAttr "Apron_02.liw" "skinCluster1.lw[4]";
connectAttr "Apron_01.liw" "skinCluster1.lw[5]";
connectAttr "Apron_07.liw" "skinCluster1.lw[6]";
connectAttr "Aproncollar_R.liw" "skinCluster1.lw[7]";
connectAttr "Aproncollar_L.liw" "skinCluster1.lw[8]";
connectAttr "Aproncollar_L_sub.liw" "skinCluster1.lw[9]";
connectAttr "Aproncollar_R_sub.liw" "skinCluster1.lw[10]";
connectAttr "Apron_03.obcc" "skinCluster1.ifcl[0]";
connectAttr "Apron_04.obcc" "skinCluster1.ifcl[1]";
connectAttr "Apron_05.obcc" "skinCluster1.ifcl[2]";
connectAttr "Apron_06.obcc" "skinCluster1.ifcl[3]";
connectAttr "Apron_02.obcc" "skinCluster1.ifcl[4]";
connectAttr "Apron_01.obcc" "skinCluster1.ifcl[5]";
connectAttr "Apron_07.obcc" "skinCluster1.ifcl[6]";
connectAttr "Aproncollar_R.obcc" "skinCluster1.ifcl[7]";
connectAttr "Aproncollar_L.obcc" "skinCluster1.ifcl[8]";
connectAttr "Aproncollar_L_sub.obcc" "skinCluster1.ifcl[9]";
connectAttr "Aproncollar_R_sub.obcc" "skinCluster1.ifcl[10]";
connectAttr "Apron_01.msg" "skinCluster1.ptt";
connectAttr "apron_rig.msg" "bindPose2.m[0]";
connectAttr "Apron_03.msg" "bindPose2.m[1]";
connectAttr "Apron_04.msg" "bindPose2.m[2]";
connectAttr "Apron_05.msg" "bindPose2.m[3]";
connectAttr "Apron_06.msg" "bindPose2.m[4]";
connectAttr "Apron_02.msg" "bindPose2.m[5]";
connectAttr "Apron_01.msg" "bindPose2.m[6]";
connectAttr "Apron_07.msg" "bindPose2.m[7]";
connectAttr "Aproncollar_R.msg" "bindPose2.m[8]";
connectAttr "Aproncollar_L.msg" "bindPose2.m[9]";
connectAttr "Aproncollar_L_sub.msg" "bindPose2.m[10]";
connectAttr "Aproncollar_R_sub.msg" "bindPose2.m[11]";
connectAttr "bindPose2.w" "bindPose2.p[0]";
connectAttr "bindPose2.m[0]" "bindPose2.p[1]";
connectAttr "bindPose2.m[1]" "bindPose2.p[2]";
connectAttr "bindPose2.m[2]" "bindPose2.p[3]";
connectAttr "bindPose2.m[3]" "bindPose2.p[4]";
connectAttr "bindPose2.m[1]" "bindPose2.p[5]";
connectAttr "bindPose2.m[5]" "bindPose2.p[6]";
connectAttr "bindPose2.m[6]" "bindPose2.p[7]";
connectAttr "bindPose2.m[5]" "bindPose2.p[8]";
connectAttr "bindPose2.m[5]" "bindPose2.p[9]";
connectAttr "bindPose2.m[5]" "bindPose2.p[10]";
connectAttr "bindPose2.m[5]" "bindPose2.p[11]";
connectAttr "Apron_03.bps" "bindPose2.wm[1]";
connectAttr "Apron_04.bps" "bindPose2.wm[2]";
connectAttr "Apron_05.bps" "bindPose2.wm[3]";
connectAttr "Apron_06.bps" "bindPose2.wm[4]";
connectAttr "Apron_02.bps" "bindPose2.wm[5]";
connectAttr "Apron_01.bps" "bindPose2.wm[6]";
connectAttr "Apron_07.bps" "bindPose2.wm[7]";
connectAttr "Aproncollar_R.bps" "bindPose2.wm[8]";
connectAttr "Aproncollar_L.bps" "bindPose2.wm[9]";
connectAttr "Aproncollar_L_sub.bps" "bindPose2.wm[10]";
connectAttr "Aproncollar_R_sub.bps" "bindPose2.wm[11]";
connectAttr ":defaultArnoldDisplayDriver.msg" ":defaultArnoldRenderOptions.drivers"
		 -na;
connectAttr ":defaultArnoldFilter.msg" ":defaultArnoldRenderOptions.filt";
connectAttr ":defaultArnoldDriver.msg" ":defaultArnoldRenderOptions.drvr";
connectAttr "lambert2SG.pa" ":renderPartition.st" -na;
connectAttr "apron_shd.msg" ":defaultShaderList1.s" -na;
connectAttr "place2dTexture1.msg" ":defaultRenderUtilityList1.u" -na;
connectAttr "defaultRenderLayer.msg" ":defaultRenderingList1.r" -na;
connectAttr "file1.msg" ":defaultTextureList1.tx" -na;
// End of Apron_rig_01.ma
