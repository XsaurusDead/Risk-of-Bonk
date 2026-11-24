//Maya ASCII 2023 scene
//Name: Hat_rig_01.ma
//Last modified: Mon, May 16, 2022 09:10:37 PM
//Codeset: 1252
requires maya "2023";
requires "mtoa" "5.1.0";
requires "stereoCamera" "10.0";
currentUnit -l centimeter -a degree -t film;
fileInfo "application" "maya";
fileInfo "product" "Maya 2023";
fileInfo "version" "2023";
fileInfo "cutIdentifier" "202202161415-df43006fd3";
fileInfo "osv" "Windows 10 Home v2009 (Build: 19043)";
fileInfo "UUID" "D05E130B-4D25-E465-48BB-F4BCE34638B7";
createNode transform -s -n "persp";
	rename -uid "C719E420-47DD-3ABA-2DB6-6FBB0A2F58A7";
	setAttr ".v" no;
	setAttr ".t" -type "double3" 13.807692903481422 17.08212554065069 40.100452165226436 ;
	setAttr ".r" -type "double3" -21.93835272964612 -1061.0000000004011 0 ;
createNode camera -s -n "perspShape" -p "persp";
	rename -uid "6E294219-43F4-57FF-CE54-6D938720C850";
	setAttr -k off ".v" no;
	setAttr ".fl" 34.999999999999993;
	setAttr ".coi" 45.721960161796829;
	setAttr ".imn" -type "string" "persp";
	setAttr ".den" -type "string" "persp_depth";
	setAttr ".man" -type "string" "persp_mask";
	setAttr ".tp" -type "double3" 0 0 2.384185791015625e-07 ;
	setAttr ".hc" -type "string" "viewSet -p %camera";
createNode transform -s -n "top";
	rename -uid "86DF2A72-40A8-2A55-16A0-7BB6082CA17C";
	setAttr ".v" no;
	setAttr ".t" -type "double3" 0 1000.1 0 ;
	setAttr ".r" -type "double3" -90 0 0 ;
createNode camera -s -n "topShape" -p "top";
	rename -uid "EDB31E05-4464-5529-D84E-D8A2ABD71464";
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
	rename -uid "1C5F2879-40A5-EFB3-A73A-F2A04A8D51EF";
	setAttr ".v" no;
	setAttr ".t" -type "double3" 0.8093608343583325 -0.45963002696370631 1000.1038053534876 ;
createNode camera -s -n "frontShape" -p "front";
	rename -uid "D3A19354-427C-E33B-6CD1-63BC4DDF1885";
	setAttr -k off ".v" no;
	setAttr ".rnd" no;
	setAttr ".coi" 1000.103805115069;
	setAttr ".ow" 15.480531296690264;
	setAttr ".imn" -type "string" "front";
	setAttr ".den" -type "string" "front_depth";
	setAttr ".man" -type "string" "front_mask";
	setAttr ".tp" -type "double3" 2.7588777542114258 -0.0087213516235351562 2.384185791015625e-07 ;
	setAttr ".hc" -type "string" "viewSet -f %camera";
	setAttr ".o" yes;
	setAttr ".ai_translator" -type "string" "orthographic";
createNode transform -s -n "side";
	rename -uid "128956E5-4432-8AEE-F916-E9B905332039";
	setAttr ".v" no;
	setAttr ".t" -type "double3" 1000.1 0 0 ;
	setAttr ".r" -type "double3" 0 90 0 ;
createNode camera -s -n "sideShape" -p "side";
	rename -uid "31B70AE9-4BBD-A660-ABBD-5195DE129338";
	setAttr -k off ".v" no;
	setAttr ".rnd" no;
	setAttr ".coi" 1000.1;
	setAttr ".ow" 30;
	setAttr ".imn" -type "string" "side";
	setAttr ".den" -type "string" "side_depth";
	setAttr ".man" -type "string" "side_mask";
	setAttr ".hc" -type "string" "viewSet -s %camera";
	setAttr ".o" yes;
	setAttr ".ai_translator" -type "string" "orthographic";
createNode transform -n "cb_hat_all";
	rename -uid "678DFBFD-4F31-39F4-7AB9-B5BA4C8AAFBC";
createNode transform -n "cb_hat_ctrls" -p "cb_hat_all";
	rename -uid "1DF7C46E-438E-8402-9271-689C052ABB23";
createNode transform -n "rac_placer_ctrl" -p "cb_hat_ctrls";
	rename -uid "4B162E12-4472-E3EF-27DE-71BE6CE096F7";
createNode nurbsCurve -n "rac_placer_ctrlShape" -p "rac_placer_ctrl";
	rename -uid "5E7F1BE4-4BB1-C6B8-30D9-5783766B8641";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 14;
	setAttr ".cc" -type "nurbsCurve" 
		1 4 0 no 3
		5 0 1.4142135623730949 2.8284271247461898 4.2426406871192848 5.6568542494923797
		
		5
		-6.4393593078958489 8.8817841970012523e-16 -6.4393593078958453
		-6.43935930789584 0 6.4393593078958453
		6.43935930789584 -8.8817841970012523e-16 6.4393593078958453
		6.4393593078958489 0 -6.4393593078958453
		-6.43935930789584 8.8817841970012523e-16 -6.4393593078958533
		;
createNode nurbsCurve -n "rac_placer_ctrlShape1" -p "rac_placer_ctrl";
	rename -uid "D728C668-4FC4-D721-613D-2DA2696A4849";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 14;
	setAttr ".cc" -type "nurbsCurve" 
		1 4 0 no 3
		5 0 1.4142135623730949 2.8284271247461898 4.2426406871192848 5.6568542494923797
		
		5
		-6.8877276530806411 8.8817841970012523e-16 -6.8877276530806375
		-6.8877276530806384 0 6.8877276530806375
		6.8877276530806384 -8.8817841970012523e-16 6.8877276530806375
		6.8877276530806411 0 -6.8877276530806375
		-6.8877276530806384 8.8817841970012523e-16 -6.8877276530806384
		;
createNode transform -n "cbhat_ctrl_01_offset" -p "rac_placer_ctrl";
	rename -uid "E68145FA-4A90-0C4A-9887-7FB0A3E4DC98";
createNode transform -n "cbhat_ctrl_01" -p "cbhat_ctrl_01_offset";
	rename -uid "133C6321-460A-3DF4-8548-2A8117364F15";
createNode nurbsCurve -n "cbhat_ctrl_Shape1" -p "cbhat_ctrl_01";
	rename -uid "A058CE29-46EA-F299-17EE-83A2B1C1B2E1";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 17;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		4.0186946464914417 2.3247162433707257e-16 -4.0186946464914417
		3.480012967290418e-16 3.2876452400439109e-16 -5.6832924721043456
		-4.0186946464914417 2.3247162433707252e-16 -4.0186946464914408
		-5.6832924721043474 1.7043210979852052e-32 -3.7257694585900424e-16
		-4.0186946464914417 -2.3247162433707252e-16 4.0186946464914417
		-5.6929929391239277e-16 -3.2876452400439134e-16 5.6832924721043492
		4.0186946464914417 -2.3247162433707252e-16 4.0186946464914408
		5.6832924721043474 -4.4833502059014991e-32 6.9707452726544067e-16
		4.0186946464914417 2.3247162433707257e-16 -4.0186946464914417
		3.480012967290418e-16 3.2876452400439109e-16 -5.6832924721043456
		-4.0186946464914417 2.3247162433707252e-16 -4.0186946464914408
		;
createNode transform -n "cbhat_ctrl_02_offset" -p "cbhat_ctrl_01";
	rename -uid "F7C9E2E6-453E-8D11-02B3-258F4F681460";
createNode transform -n "cbhat_ctrl_02" -p "cbhat_ctrl_02_offset";
	rename -uid "4693920B-4F1D-54C1-B193-CB8727C5E697";
createNode nurbsCurve -n "cbhat_ctrl_Shape2" -p "cbhat_ctrl_02";
	rename -uid "74D1AEF6-4828-E9CC-011A-758DCBEF3573";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 18;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		3.6172609189669722 2.6507532811683338e-16 -3.6172609189669713
		3.1323889997634141e-16 3.7487312407332381e-16 -5.1155794502452565
		-3.6172609189669722 2.6507532811683328e-16 -3.6172609189669704
		-5.1155794502452565 1.943348894959414e-32 9.9878893079347791e-17
		-3.6172609189669722 -2.6507532811683333e-16 3.6172609189669704
		-5.1243109223605338e-16 -3.74873124073324e-16 5.1155794502452583
		3.6172609189669722 -2.6507532811683328e-16 3.6172609189669704
		5.1155794502452565 -5.1121315570491004e-32 1.0626811985559666e-15
		3.6172609189669722 2.6507532811683338e-16 -3.6172609189669713
		3.1323889997634141e-16 3.7487312407332381e-16 -5.1155794502452565
		-3.6172609189669722 2.6507532811683328e-16 -3.6172609189669704
		;
createNode transform -n "cb_hat_mesh_grp" -p "cb_hat_all";
	rename -uid "5439D2E5-4442-9D09-FA6E-DFAE9EF17DF7";
	setAttr ".rp" -type "double3" 0 20.102343559265137 2.384185791015625e-07 ;
	setAttr ".sp" -type "double3" 0 20.102343559265137 2.384185791015625e-07 ;
createNode transform -n "cb_hat_mesh" -p "cb_hat_mesh_grp";
	rename -uid "BC25EA1A-4B09-B67D-2E58-5A806BA1E3D2";
	setAttr -l on ".tx";
	setAttr -l on ".ty";
	setAttr -l on ".tz";
	setAttr -l on ".rx";
	setAttr -l on ".ry";
	setAttr -l on ".rz";
	setAttr -l on ".sx";
	setAttr -l on ".sy";
	setAttr -l on ".sz";
	setAttr ".rp" -type "double3" 0 20.118587873722888 2.384185791015625e-07 ;
	setAttr ".sp" -type "double3" 0 20.118587873722888 2.384185791015625e-07 ;
createNode mesh -n "cb_hat_meshShape" -p "cb_hat_mesh";
	rename -uid "1FE6B104-4153-E7DF-8F44-618B2E252F4A";
	setAttr -k off ".v";
	setAttr ".ovdt" 2;
	setAttr ".ove" yes;
	setAttr ".vir" yes;
	setAttr ".vif" yes;
	setAttr -s 6 ".gtag";
	setAttr ".gtag[0].gtagnm" -type "string" "back";
	setAttr ".gtag[0].gtagcmp" -type "componentList" 2 "f[2]" "f[62]";
	setAttr ".gtag[1].gtagnm" -type "string" "bottom";
	setAttr ".gtag[1].gtagcmp" -type "componentList" 2 "f[3]" "f[63]";
	setAttr ".gtag[2].gtagnm" -type "string" "front";
	setAttr ".gtag[2].gtagcmp" -type "componentList" 2 "f[0]" "f[60]";
	setAttr ".gtag[3].gtagnm" -type "string" "left";
	setAttr ".gtag[3].gtagcmp" -type "componentList" 2 "f[5]" "f[65]";
	setAttr ".gtag[4].gtagnm" -type "string" "right";
	setAttr ".gtag[4].gtagcmp" -type "componentList" 2 "f[4]" "f[64]";
	setAttr ".gtag[5].gtagnm" -type "string" "top";
	setAttr ".gtag[5].gtagcmp" -type "componentList" 2 "f[1]" "f[61]";
	setAttr ".pv" -type "double2" 0.60950884222984314 0.58481922745704651 ;
	setAttr ".uvst[0].uvsn" -type "string" "map1";
	setAttr ".cuvs" -type "string" "map1";
	setAttr ".dcc" -type "string" "Ambient+Diffuse";
	setAttr ".covm[0]"  0 1 1;
	setAttr ".cdvm[0]"  0 1 1;
	setAttr -s 52 ".pt";
	setAttr ".pt[5]" -type "float3" 0.043437865 -0.038369443 0.0093536312 ;
	setAttr ".pt[6]" -type "float3" 0.032864906 -0.019026538 0.0019302599 ;
	setAttr ".pt[7]" -type "float3" -0.0066418708 0.010122737 0.0019517199 ;
	setAttr ".pt[8]" -type "float3" 0.0019392369 -0.024501104 0.014924506 ;
	setAttr ".pt[9]" -type "float3" -0.051240496 0.028367585 0.0034694083 ;
	setAttr ".pt[10]" -type "float3" -0.024175188 -0.021741262 0.019117 ;
	setAttr ".pt[28]" -type "float3" 0.042612419 -0.024461173 0.0017172863 ;
	setAttr ".pt[29]" -type "float3" 0.033805527 -0.040338587 0.012975445 ;
	setAttr ".pt[30]" -type "float3" 0.055222362 -0.039616741 0.0066540451 ;
	setAttr ".pt[31]" -type "float3" 0.052926622 -0.018853793 -0.0039210585 ;
	setAttr ".pt[32]" -type "float3" 0.0026077812 0.010210301 -0.00098918448 ;
	setAttr ".pt[33]" -type "float3" 0.012255656 -0.026966507 0.012929698 ;
	setAttr ".pt[34]" -type "float3" -0.027449628 0.026611289 -0.0033574624 ;
	setAttr ".pt[35]" -type "float3" -0.013122791 -0.023154564 0.016600218 ;
	setAttr ".pt[36]" -type "float3" -0.04893107 -0.031920247 0.031342611 ;
	setAttr ".pt[37]" -type "float3" -0.057096105 0.030984802 0.0029684706 ;
	setAttr ".pt[41]" -type "float3" -0.0055976454 -0.035732899 0.022387803 ;
	setAttr ".pt[57]" -type "float3" 0.03260963 -0.044961464 0.015857058 ;
	setAttr ".pt[58]" -type "float3" 0.022138847 -0.037191376 0.01456921 ;
	setAttr ".pt[59]" -type "float3" 0.045479853 -0.02601902 0.0017839774 ;
	setAttr ".pt[60]" -type "float3" 0.033795636 -0.021404954 0.002679162 ;
	setAttr ".pt[61]" -type "float3" -0.054906916 -0.040002171 0.037422515 ;
	setAttr ".pt[62]" -type "float3" -0.054047663 -0.028947385 0.031238312 ;
	setAttr ".pt[63]" -type "float3" -0.057730563 0.029741161 0.0043541291 ;
	setAttr ".pt[64]" -type "float3" -0.064469315 0.032232057 0.0037960827 ;
	setAttr ".pt[65]" -type "float3" -0.010126399 -0.0411897 0.026300021 ;
	setAttr ".pt[66]" -type "float3" -0.014181752 -0.031433206 0.022757132 ;
	setAttr ".pt[70]" -type "float3" 0.030621454 0.00020582892 -0.0069362358 ;
	setAttr ".pt[71]" -type "float3" -5.5410055e-06 0.042956751 -0.015492726 ;
	setAttr ".pt[72]" -type "float3" -0.040436059 0.070813909 -0.019433908 ;
	setAttr ".pt[73]" -type "float3" -0.18054427 -0.30892706 0 ;
	setAttr ".pt[74]" -type "float3" -0.18054436 -0.30892721 0 ;
	setAttr ".pt[75]" -type "float3" 0.30390674 -0.69992936 0 ;
	setAttr ".pt[80]" -type "float3" -0.008176527 -0.52843964 0 ;
	setAttr ".pt[83]" -type "float3" 0.032437265 0.00055728038 -0.0084247291 ;
	setAttr ".pt[84]" -type "float3" 0.053644042 0.0082181506 -0.018031381 ;
	setAttr ".pt[85]" -type "float3" 0.010168104 0.044297516 -0.019720756 ;
	setAttr ".pt[86]" -type "float3" -0.015892355 0.068405837 -0.026717262 ;
	setAttr ".pt[87]" -type "float3" -0.052411571 0.084304743 -0.023093387 ;
	setAttr ".pt[90]" -type "float3" -0.0081973188 0.053271011 -0.018272411 ;
	setAttr ".pt[95]" -type "float3" -0.11604049 -0.60712421 0 ;
	setAttr ".pt[97]" -type "float3" -0.29474178 -0.35212618 0 ;
	setAttr ".pt[98]" -type "float3" 0.20635282 -0.79107392 0 ;
	setAttr ".pt[99]" -type "float3" -0.29474169 -0.35212567 0 ;
	setAttr ".pt[100]" -type "float3" 0.031022292 0.0016754507 -0.0089695156 ;
	setAttr ".pt[101]" -type "float3" 0.02090627 0.00023312785 -0.0047089215 ;
	setAttr ".pt[102]" -type "float3" -0.059070036 0.095938355 -0.02769061 ;
	setAttr ".pt[103]" -type "float3" -0.057272054 0.079702884 -0.019192794 ;
	setAttr ".pt[104]" -type "float3" -0.013053983 0.058069095 -0.019488458 ;
	setAttr ".pt[105]" -type "float3" -0.016515065 0.049088281 -0.013736855 ;
	setAttr ".pt[111]" -type "float3" 0 0.0030308473 0 ;
	setAttr ".pt[112]" -type "float3" 0 0.0023830733 0 ;
createNode mesh -n "polySurfaceShape1" -p "cb_hat_mesh";
	rename -uid "DE56E8FA-45BC-27DD-4A87-B7A6026B9A36";
	setAttr -k off ".v";
	setAttr ".io" yes;
	setAttr ".vir" yes;
	setAttr ".vif" yes;
	setAttr -s 6 ".gtag";
	setAttr ".gtag[0].gtagnm" -type "string" "back";
	setAttr ".gtag[0].gtagcmp" -type "componentList" 2 "f[2]" "f[62]";
	setAttr ".gtag[1].gtagnm" -type "string" "bottom";
	setAttr ".gtag[1].gtagcmp" -type "componentList" 2 "f[3]" "f[63]";
	setAttr ".gtag[2].gtagnm" -type "string" "front";
	setAttr ".gtag[2].gtagcmp" -type "componentList" 2 "f[0]" "f[60]";
	setAttr ".gtag[3].gtagnm" -type "string" "left";
	setAttr ".gtag[3].gtagcmp" -type "componentList" 2 "f[5]" "f[65]";
	setAttr ".gtag[4].gtagnm" -type "string" "right";
	setAttr ".gtag[4].gtagcmp" -type "componentList" 2 "f[4]" "f[64]";
	setAttr ".gtag[5].gtagnm" -type "string" "top";
	setAttr ".gtag[5].gtagcmp" -type "componentList" 2 "f[1]" "f[61]";
	setAttr ".pv" -type "double2" 0.61049149930477142 0.56451350450515747 ;
	setAttr ".uvst[0].uvsn" -type "string" "map1";
	setAttr -s 146 ".uvst[0].uvsp[0:145]" -type "float2" 0.8262344 0.54592127
		 0.83940178 0.39019766 0.67057747 0.021626592 0.55329812 0.054571003 0.86187607 0.4637014
		 0.7890504 0.011726379 0.81548315 0.52149451 0.83326048 0.46232396 0.82163876 0.40741381
		 0.5946635 0.17369804 0.47811598 0.19718388 0.029436439 0.35302314 0.80361259 0.13521171
		 0.69909418 0.16018471 0.79523265 0.042377949 0.67734468 0.051498145 0.56312728 0.082966983
		 0.79381555 0.092368782 0.69178164 0.12205204 0.58744407 0.12913352 0.57512569 0.73664147
		 0.53468275 0.80937022 0.088086151 0.65471673 0.2047776 0.64202344 0.59899873 0.25665635
		 0.49065667 0.24521676 0.35047498 0.81723559 0.30201474 0.92714894 0.077836365 0.40081909
		 0.82509923 0.21337482 0.29879931 0.70895898 0.71422482 0.24857622 0.035167277 0.36011377
		 0.80880529 0.16901505 0.70370305 0.18593726 0.60178006 0.20802513 0.48003614 0.20452821
		 0.45506236 0.10925767 0.79731691 0.55478537 0.79632318 0.53421694 0.79296845 0.46476218
		 0.78940874 0.39095488 0.78785598 0.35876134 0.78316247 0.26308197 0.4627654 0.13860124
		 0.028992951 0.27150875 0.021928281 0.33248779 0.47321796 0.17846122 0.022202075 0.34225795
		 0.80134273 0.1260733 0.69704723 0.14926106 0.59330297 0.16420165 0.47521019 0.18607318
		 0.63804972 0.68386251 0.62049091 0.66271859 0.62807631 0.76374221 0.59403187 0.84194213
		 0.58893746 0.82667679 0.52088791 0.83354992 0.63052309 0.64667469 0.64658648 0.67593616
		 0.63804585 0.7691406 0.61547959 0.66962409 0.61963737 0.69638854 0.53042841 0.81664675
		 0.57874227 0.80308855 0.60672832 0.75490075 0.34260407 0.10969087 0.76768172 0.54874825
		 0.7760244 0.52339971 0.75263011 0.46622109 0.75891769 0.41044596 0.73957527 0.39502424
		 0.11608946 0.18781936 0.22421773 0.13841808 0.72428179 0.47034624 0.34799579 0.13925529
		 0.12573954 0.21755204 0.23299409 0.16775939 0.15148833 0.26041278 0.25500131 0.23631692
		 0.34944838 0.19140008 0.16143686 0.29347456 0.26373935 0.26261219 0.36152017 0.22484019
		 0.59739172 0.67220736 0.54610252 0.71960455 0.51143593 0.77092236 0.4017708 0.30825451
		 0.048094157 0.76506609 0.18374121 0.94816083 0.18343809 0.38121948 0.090812244 0.87227041
		 0.2973327 0.35762459 0.17595127 0.33456227 0.27588052 0.2978496 0.37557533 0.26720214
		 0.16393161 0.3025524 0.26729947 0.27313873 0.36498201 0.23378634 0.59747601 0.64790452
		 0.59512848 0.65943092 0.52009523 0.70083553 0.52960658 0.70679098 0.47944242 0.77461421
		 0.49545172 0.7716831 0.66735548 0.58321309 0.18701233 0.67561728 0.27182451 0.73175806
		 0.31443173 0.81837457 0.28099388 0.90038174 0.19339812 0.91341621 0.11936318 0.85147816
		 0.084941581 0.75577164 0.55224878 0.57191324 0.11195698 0.6851055 0.44482571 0.65998906
		 0.41194701 0.79174274 0.48359194 0.89737356 0.61158109 0.90880567 0.71059263 0.8146401
		 0.73461372 0.67747557 0.41108182 0.33089775 0.30592981 0.3800413 0.19348739 0.40449658
		 0.095964044 0.41718248 0.49730223 0.27070066 0.60192513 0.28095981 0.71766937 0.27233687
		 0.82771587 0.23859844 0.61815411 0.47087735 0.64913166 0.33078688 0.66452539 0.6051352
		 0.88765073 0.017935157 0.8024863 0.66212755 0.96754277 0.4539727 0.92317438 0.31747609
		 0.93433017 0.59210587 0.94205314 0.091729566 0.94661105 0.1003848 0.94557256 0.11332059
		 0.90599501 0.042013407 0.033177018 0.24154124 0.94404399 0.12231493 0.92676634 0.17872587
		 0.91896826 0.20187807;
	setAttr ".cuvs" -type "string" "map1";
	setAttr ".dcc" -type "string" "Ambient+Diffuse";
	setAttr ".covm[0]"  0 1 1;
	setAttr ".cdvm[0]"  0 1 1;
	setAttr -s 114 ".vt[0:113]"  -1.25566518 19.37829971 -1.47358119 -1.25566518 19.37829971 1.47358072
		 0 19.29589653 2.39244413 0 19.29589653 -2.39244413 -1.67421961 19.42851639 -2.0006166e-08
		 -0.40236449 20.83881569 1.22645783 0 21.12198067 1.40131104 0 21.074138641 -5.5547517e-08
		 -0.52056706 20.93115807 -5.3725557e-08 0 21.12198067 -1.4013114 -0.71430755 20.79801941 -1.1183548
		 0 19.089399338 3.81653929 -2.82487321 19.96795273 2.74805474 0 19.089399338 -3.81653881
		 -2.82487345 19.96795273 -2.74805403 -3.15899467 20.87754631 -2.3452817e-08 0 19.24986649 -2.77528715
		 -1.62583828 19.35456276 -1.7877655 -2.17563462 19.50971985 -1.9662025e-08 -1.62583828 19.35456276 1.78776538
		 0 19.2383709 2.8627975 0 19.11391258 -3.6770668 -2.50926042 19.55229187 -2.29830074
		 -3.062256336 20.33178329 -1.9887143e-08 -2.50926042 19.55229187 2.29830074 0 19.11391258 3.6770668
		 0 19.16527367 2.30029535 -1.17948616 19.19928741 1.40257061 0 21.11962128 1.72194171
		 -0.36624721 21.14583588 1.45216012 -0.42247182 20.62931061 1.24638855 0 20.7479763 1.4066118
		 0 20.8851223 -0.026953191 -0.55878657 20.7317543 -0.012203745 0 20.68610001 -1.38146901
		 -0.74134439 20.58624458 -1.12727487 -0.93162888 21.16737366 -1.3018508 0 21.080509186 -1.66997612
		 0 19.16527367 -2.30029559 -1.17948616 19.19928741 -1.40257084 -1.57292747 19.24705696 6.4695143e-08
		 -0.69586742 21.081047058 0.0037333064 -1.6572603 19.14954376 1.77484059 0 19.031957626 2.84148812
		 0 19.043369293 -2.75443697 -1.65708303 19.1495285 -1.77466607 -2.23201585 19.3096981 -8.7688949e-09
		 0 18.91326714 -3.69081593 -2.63317657 19.38579178 -2.30666661 -3.23217106 20.2121315 2.394026e-08
		 -2.63317704 19.38579178 2.30666685 0 18.91326714 3.69081593 0 18.89227867 -3.84133124
		 -2.94564843 19.82122231 -2.76182508 -3.34212089 20.77932167 1.4364564e-08 -2.94564772 19.82122231 2.76182556
		 0 18.89227867 3.84133172 -0.42488709 21.2238884 1.54706764 -0.32992995 21.31240845 1.36103344
		 0 21.12774849 1.83190382 0 21.17421532 1.52495193 -1.11435962 21.21004677 -1.43668485
		 -0.86308849 21.29059601 -1.24957585 0 21.17421532 -1.52495205 0 21.12774849 -1.83190393
		 -0.78363371 21.1671257 -3.8116884e-08 -0.62456554 21.2377491 -4.8956863e-08 1.25566518 19.37829971 -1.47358119
		 1.25566518 19.37829971 1.47358072 1.67421961 19.42851639 -2.0006166e-08 0.28047633 21.073989868 1.25891125
		 0.52056706 20.93115807 -5.3725557e-08 0.73320901 21.036088943 -1.14794803 2.82487321 19.96795273 2.74805474
		 2.82487345 19.96795273 -2.74805403 3.15899467 20.87754631 -2.3452817e-08 1.62583828 19.35456276 -1.7877655
		 2.17563462 19.50971985 -1.9662025e-08 1.62583828 19.35456276 1.78776538 2.50926042 19.55229187 -2.29830074
		 3.062256336 20.33178329 -1.9887143e-08 2.50926042 19.55229187 2.29830074 1.17948616 19.19928741 1.40257061
		 0.36624721 21.14583588 1.45216012 0.42247182 20.62931061 1.24638855 0.55878657 20.7317543 -0.012203745
		 0.74134439 20.58624458 -1.12727487 0.93162888 21.16737366 -1.3018508 1.17948616 19.19928741 -1.40257084
		 1.57292747 19.24705696 6.4695143e-08 0.69586742 21.081047058 0.0037333064 1.6572603 19.14954376 1.77484059
		 1.65708303 19.1495285 -1.77466607 2.23201585 19.3096981 -8.7688949e-09 2.63317657 19.38579178 -2.30666661
		 3.23217106 20.2121315 2.394026e-08 2.63317704 19.38579178 2.30666685 2.94564843 19.82122231 -2.76182508
		 3.34212089 20.77932167 1.4364564e-08 2.94564772 19.82122231 2.76182556 0.42488709 21.2238884 1.54706764
		 0.32992995 21.31240845 1.36103344 1.11435962 21.21004677 -1.43668485 0.86308849 21.29059601 -1.24957585
		 0.78363371 21.1671257 -3.8116884e-08 0.62456554 21.2377491 -4.8956863e-08 0 19.87043571 2.31948495
		 -1.052083611 19.95018387 1.5576421 -1.46965706 19.9680233 -2.6330516e-08 -1.26447618 19.94639397 -1.52363884
		 0 19.87043571 -2.31948495 1.26447618 19.94639397 -1.52363884 1.46965706 19.9680233 -2.6330516e-08
		 1.052083611 19.95018387 1.5576421;
	setAttr -s 224 ".ed";
	setAttr ".ed[0:165]"  2 1 0 3 0 0 4 0 0 1 4 0 5 6 0 6 7 0 7 8 1 5 8 0 9 7 0
		 10 9 0 8 10 0 2 20 0 1 19 0 11 12 0 3 16 0 0 17 0 13 14 0 4 18 0 15 14 0 12 15 0
		 16 21 0 17 22 0 16 17 1 18 23 0 17 18 1 19 24 0 18 19 1 20 25 0 19 20 1 21 13 0 22 14 0
		 21 22 1 23 15 0 22 23 1 24 12 0 23 24 1 25 11 0 24 25 1 26 27 0 28 26 0 29 28 0 27 29 1
		 30 31 0 31 32 0 32 33 1 30 33 0 34 32 0 35 34 0 33 35 0 36 37 0 37 38 0 38 39 0 36 39 1
		 27 40 0 29 41 0 41 40 1 40 39 0 41 36 0 28 31 0 29 30 0 41 33 0 36 35 0 37 34 0 27 42 0
		 42 43 1 26 43 0 38 44 0 44 45 1 39 45 0 45 46 1 40 46 0 46 42 1 47 48 1 48 49 1 49 50 1
		 50 51 1 43 51 0 44 47 0 45 48 0 46 49 0 42 50 0 13 52 0 47 52 0 14 53 0 52 53 0 48 53 0
		 15 54 0 54 53 0 49 54 0 12 55 0 55 54 0 50 55 0 11 56 0 56 55 0 51 56 0 59 106 0
		 60 6 0 63 9 0 64 110 0 57 58 1 58 60 0 60 59 0 59 57 0 57 65 0 65 66 1 66 58 0 61 62 1
		 62 66 0 65 61 0 61 64 0 64 63 0 63 62 0 1 107 0 61 109 0 4 108 0 58 5 0 66 8 1 10 62 0
		 2 68 0 3 67 0 69 67 0 68 69 0 70 6 0 7 71 1 70 71 0 72 9 0 71 72 0 68 78 0 11 73 0
		 67 76 0 13 74 0 69 77 0 75 74 0 73 75 0 76 79 0 16 76 1 77 80 0 76 77 1 78 81 0 77 78 1
		 78 20 1 79 74 0 21 79 1 80 75 0 79 80 1 81 73 0 80 81 1 81 25 1 26 82 0 83 28 0 82 83 1
		 84 31 0 32 85 1 84 85 0 86 34 0 85 86 0 87 37 0 38 88 0 87 88 1 82 89 0 83 90 0 90 89 1
		 89 88 0 90 87 0 83 84 0 90 85 0;
	setAttr ".ed[166:223]" 87 86 0 82 91 0 91 43 1 44 92 1 88 92 0 92 93 1 89 93 0
		 93 91 1 47 94 1 94 95 1 95 96 1 96 51 1 92 94 0 93 95 0 91 96 0 74 97 0 52 97 0 94 97 0
		 75 98 0 98 97 0 95 98 0 73 99 0 99 98 0 96 99 0 56 99 0 100 101 1 101 60 0 59 100 0
		 100 104 0 104 105 1 105 101 0 102 103 1 103 105 0 104 102 0 102 64 0 63 103 0 68 113 0
		 102 111 0 69 112 0 101 70 0 105 71 1 72 103 0 106 2 0 107 57 0 106 107 1 108 65 0
		 107 108 1 109 0 0 108 109 1 110 3 0 109 110 1 111 67 0 110 111 1 112 104 0 111 112 1
		 113 100 0 112 113 1 113 106 1;
	setAttr -s 112 -ch 448 ".fc[0:111]" -type "polyFaces" 
		f 4 -39 -40 -41 -42
		mu 0 4 137 134 38 0
		f 4 42 43 44 -46
		mu 0 4 6 39 40 7
		f 4 -45 -47 -48 -49
		mu 0 4 7 40 41 8
		f 4 49 50 51 -53
		mu 0 4 1 42 43 136
		f 4 -54 41 54 55
		mu 0 4 135 137 0 4
		f 4 -57 -56 57 52
		mu 0 4 136 135 4 1
		f 4 40 58 -43 -60
		mu 0 4 0 38 39 6
		f 4 -55 59 45 -61
		mu 0 4 4 0 6 7
		f 4 -50 61 47 -63
		mu 0 4 42 1 8 41
		f 4 -58 60 48 -62
		mu 0 4 1 4 7 8
		f 4 38 63 64 -66
		mu 0 4 37 3 16 44
		f 4 -52 66 67 -69
		mu 0 4 5 133 141 14
		f 4 56 68 69 -71
		mu 0 4 2 5 14 15
		f 4 53 70 71 -64
		mu 0 4 3 2 15 16
		f 4 -79 -68 77 72
		mu 0 4 17 14 141 138
		f 4 -80 -70 78 73
		mu 0 4 18 15 14 17
		f 4 -81 -72 79 74
		mu 0 4 19 16 15 18
		f 4 -65 80 75 -77
		mu 0 4 44 16 19 47
		f 4 -73 82 84 -86
		mu 0 4 17 138 139 49
		f 4 -74 85 -88 -89
		mu 0 4 18 17 49 50
		f 4 -75 88 -91 -92
		mu 0 4 19 18 50 51
		f 4 -76 91 -94 -95
		mu 0 4 47 19 51 52
		f 4 7 -7 -6 -5
		mu 0 4 63 66 20 62
		f 4 10 9 8 6
		mu 0 4 66 65 21 20
		f 4 11 -29 -13 -1
		mu 0 4 126 25 24 127
		f 4 15 -23 -15 1
		mu 0 4 129 29 144 145
		f 4 17 -25 -16 -3
		mu 0 4 128 31 29 129
		f 4 12 -27 -18 -4
		mu 0 4 127 24 31 128
		f 4 -32 -21 22 21
		mu 0 4 33 143 144 29
		f 4 -34 -22 24 23
		mu 0 4 34 33 29 31
		f 4 -36 -24 26 25
		mu 0 4 35 34 31 24
		f 4 -38 -26 28 27
		mu 0 4 36 35 24 25
		f 4 30 -17 -30 31
		mu 0 4 33 12 140 143
		f 4 32 18 -31 33
		mu 0 4 34 13 12 33
		f 4 34 19 -33 35
		mu 0 4 35 9 13 34
		f 4 36 13 -35 37
		mu 0 4 36 10 9 35
		f 4 16 83 -85 -82
		mu 0 4 140 12 49 139
		f 4 -19 86 87 -84
		mu 0 4 12 13 50 49
		f 4 -20 89 90 -87
		mu 0 4 13 9 51 50
		f 4 -14 92 93 -90
		mu 0 4 9 10 52 51
		f 4 99 100 101 102
		mu 0 4 60 53 54 59
		f 4 -100 103 104 105
		mu 0 4 53 60 61 55
		f 4 106 107 -105 108
		mu 0 4 56 57 55 61
		f 4 -107 109 110 111
		mu 0 4 57 56 58 64
		f 4 209 -103 95 210
		mu 0 4 121 60 59 106
		f 4 113 216 -99 -110
		mu 0 4 56 119 118 58
		f 4 211 -104 -210 212
		mu 0 4 120 61 60 121
		f 4 -114 -109 -212 214
		mu 0 4 119 56 61 120
		f 4 115 4 -97 -101
		mu 0 4 53 63 62 54
		f 4 116 -8 -116 -106
		mu 0 4 55 66 63 53
		f 4 -112 97 -10 117
		mu 0 4 57 64 21 65
		f 4 -118 -11 -117 -108
		mu 0 4 57 65 66 55
		f 4 150 149 39 148
		mu 0 4 132 68 38 134
		f 4 153 -153 -44 -152
		mu 0 4 69 70 40 39
		f 4 155 154 46 152
		mu 0 4 70 71 41 40
		f 4 158 -158 -51 -157
		mu 0 4 72 131 43 42
		f 4 -162 -161 -151 159
		mu 0 4 130 75 68 132
		f 4 -159 -164 161 162
		mu 0 4 131 72 75 130
		f 4 164 151 -59 -150
		mu 0 4 68 69 39 38
		f 4 165 -154 -165 160
		mu 0 4 75 70 69 68
		f 4 62 -155 -167 156
		mu 0 4 42 41 71 72
		f 4 166 -156 -166 163
		mu 0 4 72 71 70 75
		f 4 65 -169 -168 -149
		mu 0 4 37 44 76 67
		f 4 170 -170 -67 157
		mu 0 4 73 77 45 142
		f 4 172 -172 -171 -163
		mu 0 4 74 78 77 73
		f 4 167 -174 -173 -160
		mu 0 4 67 76 78 74
		f 4 -175 -78 169 178
		mu 0 4 79 46 45 77
		f 4 -176 -179 171 179
		mu 0 4 80 79 77 78
		f 4 -177 -180 173 180
		mu 0 4 81 80 78 76
		f 4 76 -178 -181 168
		mu 0 4 44 47 81 76
		f 4 183 -183 -83 174
		mu 0 4 79 82 48 46
		f 4 186 185 -184 175
		mu 0 4 80 83 82 79
		f 4 189 188 -187 176
		mu 0 4 81 84 83 80
		f 4 94 190 -190 177
		mu 0 4 47 52 84 81
		f 4 122 5 123 -125
		mu 0 4 85 62 20 86
		f 4 -124 -9 -126 -127
		mu 0 4 86 20 21 87
		f 4 118 127 140 -12
		mu 0 4 126 122 88 25
		f 4 -120 14 135 -130
		mu 0 4 124 125 28 91
		f 4 120 129 137 -132
		mu 0 4 123 124 91 93
		f 4 121 131 139 -128
		mu 0 4 122 123 93 88
		f 4 -135 -136 20 142
		mu 0 4 94 91 28 32
		f 4 -137 -138 134 144
		mu 0 4 95 93 91 94
		f 4 -139 -140 136 146
		mu 0 4 96 88 93 95
		f 4 -28 -141 138 147
		mu 0 4 36 25 88 96
		f 4 -143 29 130 -142
		mu 0 4 94 32 11 97
		f 4 -145 141 -133 -144
		mu 0 4 95 94 97 98
		f 4 -147 143 -134 -146
		mu 0 4 96 95 98 99
		f 4 -148 145 -129 -37
		mu 0 4 36 96 99 10
		f 4 81 182 -182 -131
		mu 0 4 11 48 82 97
		f 4 181 -186 -185 132
		mu 0 4 97 82 83 98
		f 4 184 -189 -188 133
		mu 0 4 98 83 84 99
		f 4 187 -191 -93 128
		mu 0 4 99 84 52 10
		f 4 -194 -102 -193 -192
		mu 0 4 100 59 54 101
		f 4 -197 -196 -195 191
		mu 0 4 101 103 102 100
		f 4 -200 195 -199 -198
		mu 0 4 104 102 103 105
		f 4 -202 -111 -201 197
		mu 0 4 105 64 58 104
		f 4 223 -96 193 -222
		mu 0 4 114 106 59 100
		f 4 200 98 218 -204
		mu 0 4 104 58 118 117
		f 4 222 221 194 -220
		mu 0 4 116 114 100 102
		f 4 220 219 199 203
		mu 0 4 117 116 102 104
		f 4 192 96 -123 -206
		mu 0 4 101 54 62 85
		f 4 196 205 124 -207
		mu 0 4 103 101 85 86
		f 4 -208 125 -98 201
		mu 0 4 105 87 21 64
		f 4 198 206 126 207
		mu 0 4 105 103 86 87
		f 4 112 -211 208 0
		mu 0 4 23 107 115 22
		f 4 114 -213 -113 3
		mu 0 4 30 108 107 23
		f 4 -214 -215 -115 2
		mu 0 4 26 109 108 30
		f 4 -217 213 -2 -216
		mu 0 4 110 109 26 27
		f 4 -219 215 119 -218
		mu 0 4 111 110 27 90
		f 4 -121 204 -221 217
		mu 0 4 90 92 112 111
		f 4 -122 202 -223 -205
		mu 0 4 92 89 113 112
		f 4 -119 -209 -224 -203
		mu 0 4 89 22 115 113;
	setAttr ".cd" -type "dataPolyComponent" Index_Data Edge 0 ;
	setAttr ".cvd" -type "dataPolyComponent" Index_Data Vertex 0 ;
	setAttr ".pd[0]" -type "dataPolyComponent" Index_Data UV 92 
		1 0 
		2 0 
		3 0 
		4 0 
		5 0 
		9 0 
		10 0 
		11 0 
		12 0 
		13 0 
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
		33 0 
		34 0 
		35 0 
		36 0 
		37 0 
		38 0 
		39 0 
		40 0 
		41 0 
		42 0 
		43 0 
		44 0 
		45 0 
		46 0 
		47 0 
		48 0 
		49 0 
		50 0 
		51 0 
		52 0 
		53 0 
		54 0 
		55 0 
		56 0 
		57 0 
		58 0 
		59 0 
		62 0 
		64 0 
		67 0 
		72 0 
		73 0 
		74 0 
		75 0 
		76 0 
		77 0 
		78 0 
		79 0 
		80 0 
		81 0 
		82 0 
		83 0 
		84 0 
		88 0 
		89 0 
		90 0 
		91 0 
		92 0 
		93 0 
		94 0 
		95 0 
		96 0 
		97 0 
		98 0 
		99 0 
		101 0 
		103 0 
		104 0 
		105 0 
		106 0 
		109 0 
		110 0 
		111 0 ;
	setAttr ".hfd" -type "dataPolyComponent" Index_Data Face 0 ;
createNode parentConstraint -n "cb_hat_mesh_grp_parentConstraint1" -p "cb_hat_mesh_grp";
	rename -uid "4A91B6CF-4D67-98F5-FC2F-8D9EC9AFD1D7";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "cbhat_ctrl_02W0" -dv 1 -min 0 -at "double";
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
	setAttr ".tg[0].tot" -type "double3" 0 0 2.384185791015625e-07 ;
	setAttr ".rst" -type "double3" 0 -20.102343559265137 0 ;
	setAttr -k on ".w0";
createNode scaleConstraint -n "cb_hat_mesh_grp_scaleConstraint1" -p "cb_hat_mesh_grp";
	rename -uid "05F61129-452C-C49F-A9F4-F39BE96626DE";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "cbhat_ctrl_02W0" -dv 1 -min 0 -at "double";
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
createNode lightLinker -s -n "lightLinker1";
	rename -uid "B5DD6E92-497F-CFB5-BB2B-899CC964E5B7";
	setAttr -s 4 ".lnk";
	setAttr -s 4 ".slnk";
createNode shapeEditorManager -n "shapeEditorManager";
	rename -uid "C9D2BEAF-4A14-EB2A-3E9F-5CBA5D8D3E71";
createNode poseInterpolatorManager -n "poseInterpolatorManager";
	rename -uid "B033D6AF-4F63-5B32-F049-9CA59C57B155";
createNode displayLayerManager -n "layerManager";
	rename -uid "F8D10C79-435B-F253-9755-1BA8170D2AED";
createNode displayLayer -n "defaultLayer";
	rename -uid "E85C4206-403E-33DC-243C-79BFE58EE629";
createNode renderLayerManager -n "renderLayerManager";
	rename -uid "9E0ECCED-4DAB-24C3-0602-219E6E3C1D19";
createNode renderLayer -n "defaultRenderLayer";
	rename -uid "7F7571A4-4C81-4BA8-8F28-83A6D8BAF0AE";
	setAttr ".g" yes;
createNode script -n "uiConfigurationScriptNode";
	rename -uid "32C654BA-4173-D285-CBA5-6287A9FC4D86";
	setAttr ".b" -type "string" (
		"// Maya Mel UI Configuration File.\n//\n//  This script is machine generated.  Edit at your own risk.\n//\n//\n\nglobal string $gMainPane;\nif (`paneLayout -exists $gMainPane`) {\n\n\tglobal int $gUseScenePanelConfig;\n\tint    $useSceneConfig = $gUseScenePanelConfig;\n\tint    $nodeEditorPanelVisible = stringArrayContains(\"nodeEditorPanel1\", `getPanel -vis`);\n\tint    $nodeEditorWorkspaceControlOpen = (`workspaceControl -exists nodeEditorPanel1Window` && `workspaceControl -q -visible nodeEditorPanel1Window`);\n\tint    $menusOkayInPanels = `optionVar -q allowMenusInPanels`;\n\tint    $nVisPanes = `paneLayout -q -nvp $gMainPane`;\n\tint    $nPanes = 0;\n\tstring $editorName;\n\tstring $panelName;\n\tstring $itemFilterName;\n\tstring $panelConfig;\n\n\t//\n\t//  get current state of the UI\n\t//\n\tsceneUIReplacement -update $gMainPane;\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Top View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Top View\")) -mbv $menusOkayInPanels  $panelName;\n"
		+ "\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|top\" \n            -useInteractiveMode 0\n            -displayLights \"default\" \n            -displayAppearance \"smoothShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n            -wireframeOnShaded 0\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 0\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n            -xray 0\n            -jointXray 0\n            -activeComponentsXray 0\n            -displayTextures 0\n            -smoothWireframe 0\n            -lineWidth 1\n            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n"
		+ "            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -rendererName \"vp2Renderer\" \n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 256 256 \n            -bumpResolution 512 512 \n            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 1\n            -occlusionCulling 0\n            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n            -interactiveBackFaceCull 0\n            -sortTransparent 1\n            -controllers 1\n            -nurbsCurves 1\n            -nurbsSurfaces 1\n            -polymeshes 1\n            -subdivSurfaces 1\n            -planes 1\n            -lights 1\n            -cameras 1\n            -controlVertices 1\n"
		+ "            -hulls 1\n            -grid 1\n            -imagePlane 1\n            -joints 1\n            -ikHandles 1\n            -deformers 1\n            -dynamics 1\n            -particleInstancers 1\n            -fluids 1\n            -hairSystems 1\n            -follicles 1\n            -nCloths 1\n            -nParticles 1\n            -nRigids 1\n            -dynamicConstraints 1\n            -locators 1\n            -manipulators 1\n            -pluginShapes 1\n            -dimensions 1\n            -handles 1\n            -pivots 1\n            -textures 1\n            -strokes 1\n            -motionTrails 1\n            -clipGhosts 1\n            -greasePencils 0\n            -shadows 0\n            -captureSequenceNumber -1\n            -width 1416\n            -height 529\n            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 1 \n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n"
		+ "\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Side View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Side View\")) -mbv $menusOkayInPanels  $panelName;\n\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|side\" \n            -useInteractiveMode 0\n            -displayLights \"default\" \n            -displayAppearance \"smoothShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n            -wireframeOnShaded 0\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 0\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n            -xray 0\n            -jointXray 0\n            -activeComponentsXray 0\n            -displayTextures 0\n            -smoothWireframe 0\n            -lineWidth 1\n            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n"
		+ "            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -rendererName \"vp2Renderer\" \n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 256 256 \n            -bumpResolution 512 512 \n            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 1\n            -occlusionCulling 0\n            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n            -interactiveBackFaceCull 0\n"
		+ "            -sortTransparent 1\n            -controllers 1\n            -nurbsCurves 1\n            -nurbsSurfaces 1\n            -polymeshes 1\n            -subdivSurfaces 1\n            -planes 1\n            -lights 1\n            -cameras 1\n            -controlVertices 1\n            -hulls 1\n            -grid 1\n            -imagePlane 1\n            -joints 1\n            -ikHandles 1\n            -deformers 1\n            -dynamics 1\n            -particleInstancers 1\n            -fluids 1\n            -hairSystems 1\n            -follicles 1\n            -nCloths 1\n            -nParticles 1\n            -nRigids 1\n            -dynamicConstraints 1\n            -locators 1\n            -manipulators 1\n            -pluginShapes 1\n            -dimensions 1\n            -handles 1\n            -pivots 1\n            -textures 1\n            -strokes 1\n            -motionTrails 1\n            -clipGhosts 1\n            -greasePencils 0\n            -shadows 0\n            -captureSequenceNumber -1\n            -width 1416\n            -height 529\n"
		+ "            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 1 \n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Front View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Front View\")) -mbv $menusOkayInPanels  $panelName;\n\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|front\" \n            -useInteractiveMode 0\n            -displayLights \"default\" \n            -displayAppearance \"smoothShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n            -wireframeOnShaded 0\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 0\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n"
		+ "            -xray 1\n            -jointXray 0\n            -activeComponentsXray 0\n            -displayTextures 0\n            -smoothWireframe 0\n            -lineWidth 1\n            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -rendererName \"vp2Renderer\" \n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 256 256 \n            -bumpResolution 512 512 \n            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 1\n            -occlusionCulling 0\n"
		+ "            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n            -interactiveBackFaceCull 0\n            -sortTransparent 1\n            -controllers 1\n            -nurbsCurves 1\n            -nurbsSurfaces 1\n            -polymeshes 1\n            -subdivSurfaces 1\n            -planes 1\n            -lights 1\n            -cameras 1\n            -controlVertices 1\n            -hulls 1\n            -grid 1\n            -imagePlane 1\n            -joints 1\n            -ikHandles 1\n            -deformers 1\n            -dynamics 1\n            -particleInstancers 1\n            -fluids 1\n            -hairSystems 1\n            -follicles 1\n            -nCloths 1\n            -nParticles 1\n            -nRigids 1\n            -dynamicConstraints 1\n            -locators 1\n            -manipulators 1\n            -pluginShapes 1\n            -dimensions 1\n            -handles 1\n            -pivots 1\n"
		+ "            -textures 1\n            -strokes 1\n            -motionTrails 1\n            -clipGhosts 1\n            -greasePencils 0\n            -shadows 0\n            -captureSequenceNumber -1\n            -width 1416\n            -height 529\n            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 1 \n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Persp View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Persp View\")) -mbv $menusOkayInPanels  $panelName;\n\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|persp\" \n            -useInteractiveMode 0\n            -displayLights \"default\" \n            -displayAppearance \"smoothShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n"
		+ "            -wireframeOnShaded 0\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 0\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n            -xray 0\n            -jointXray 0\n            -activeComponentsXray 0\n            -displayTextures 1\n            -smoothWireframe 0\n            -lineWidth 1\n            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -rendererName \"vp2Renderer\" \n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 256 256 \n            -bumpResolution 512 512 \n"
		+ "            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 1\n            -occlusionCulling 0\n            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n            -interactiveBackFaceCull 0\n            -sortTransparent 1\n            -controllers 1\n            -nurbsCurves 1\n            -nurbsSurfaces 1\n            -polymeshes 1\n            -subdivSurfaces 1\n            -planes 1\n            -lights 1\n            -cameras 1\n            -controlVertices 1\n            -hulls 1\n            -grid 1\n            -imagePlane 1\n            -joints 1\n            -ikHandles 1\n            -deformers 1\n            -dynamics 1\n            -particleInstancers 1\n            -fluids 1\n            -hairSystems 1\n            -follicles 1\n"
		+ "            -nCloths 1\n            -nParticles 1\n            -nRigids 1\n            -dynamicConstraints 1\n            -locators 1\n            -manipulators 1\n            -pluginShapes 1\n            -dimensions 1\n            -handles 1\n            -pivots 1\n            -textures 1\n            -strokes 1\n            -motionTrails 1\n            -clipGhosts 1\n            -greasePencils 0\n            -shadows 0\n            -captureSequenceNumber -1\n            -width 2639\n            -height 1102\n            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 1 \n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"outlinerPanel\" (localizedPanelLabel(\"ToggledOutliner\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\toutlinerPanel -edit -l (localizedPanelLabel(\"ToggledOutliner\")) -mbv $menusOkayInPanels  $panelName;\n"
		+ "\t\t$editorName = $panelName;\n        outlinerEditor -e \n            -docTag \"isolOutln_fromSeln\" \n            -showShapes 0\n            -showAssignedMaterials 0\n            -showTimeEditor 1\n            -showReferenceNodes 0\n            -showReferenceMembers 0\n            -showAttributes 0\n            -showConnected 0\n            -showAnimCurvesOnly 0\n            -showMuteInfo 0\n            -organizeByLayer 1\n            -organizeByClip 1\n            -showAnimLayerWeight 1\n            -autoExpandLayers 1\n            -autoExpand 0\n            -showDagOnly 1\n            -showAssets 1\n            -showContainedOnly 1\n            -showPublishedAsConnected 0\n            -showParentContainers 0\n            -showContainerContents 1\n            -ignoreDagHierarchy 0\n            -expandConnections 0\n            -showUpstreamCurves 1\n            -showUnitlessCurves 1\n            -showCompounds 1\n            -showLeafs 1\n            -showNumericAttrsOnly 0\n            -highlightActive 1\n            -autoSelectNewObjects 0\n"
		+ "            -doNotSelectNewObjects 0\n            -dropIsParent 1\n            -transmitFilters 0\n            -setFilter \"defaultSetFilter\" \n            -showSetMembers 1\n            -allowMultiSelection 1\n            -alwaysToggleSelect 0\n            -directSelect 0\n            -isSet 0\n            -isSetMember 0\n            -displayMode \"DAG\" \n            -expandObjects 0\n            -setsIgnoreFilters 1\n            -containersIgnoreFilters 0\n            -editAttrName 0\n            -showAttrValues 0\n            -highlightSecondary 0\n            -showUVAttrsOnly 0\n            -showTextureNodesOnly 0\n            -attrAlphaOrder \"default\" \n            -animLayerFilterOptions \"allAffecting\" \n            -sortOrder \"none\" \n            -longNames 0\n            -niceNames 1\n            -showNamespace 1\n            -showPinIcons 0\n            -mapMotionTrails 0\n            -ignoreHiddenAttribute 0\n            -ignoreOutlinerColor 0\n            -renderFilterVisible 0\n            -renderFilterIndex 0\n            -selectionOrder \"chronological\" \n"
		+ "            -expandAttribute 0\n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"outlinerPanel\" (localizedPanelLabel(\"Outliner\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\toutlinerPanel -edit -l (localizedPanelLabel(\"Outliner\")) -mbv $menusOkayInPanels  $panelName;\n\t\t$editorName = $panelName;\n        outlinerEditor -e \n            -showShapes 0\n            -showAssignedMaterials 0\n            -showTimeEditor 1\n            -showReferenceNodes 0\n            -showReferenceMembers 0\n            -showAttributes 0\n            -showConnected 0\n            -showAnimCurvesOnly 0\n            -showMuteInfo 0\n            -organizeByLayer 1\n            -organizeByClip 1\n            -showAnimLayerWeight 1\n            -autoExpandLayers 1\n            -autoExpand 0\n            -showDagOnly 1\n            -showAssets 1\n            -showContainedOnly 1\n            -showPublishedAsConnected 0\n            -showParentContainers 0\n"
		+ "            -showContainerContents 1\n            -ignoreDagHierarchy 0\n            -expandConnections 0\n            -showUpstreamCurves 1\n            -showUnitlessCurves 1\n            -showCompounds 1\n            -showLeafs 1\n            -showNumericAttrsOnly 0\n            -highlightActive 1\n            -autoSelectNewObjects 0\n            -doNotSelectNewObjects 0\n            -dropIsParent 1\n            -transmitFilters 0\n            -setFilter \"defaultSetFilter\" \n            -showSetMembers 1\n            -allowMultiSelection 1\n            -alwaysToggleSelect 0\n            -directSelect 0\n            -displayMode \"DAG\" \n            -expandObjects 0\n            -setsIgnoreFilters 1\n            -containersIgnoreFilters 0\n            -editAttrName 0\n            -showAttrValues 0\n            -highlightSecondary 0\n            -showUVAttrsOnly 0\n            -showTextureNodesOnly 0\n            -attrAlphaOrder \"default\" \n            -animLayerFilterOptions \"allAffecting\" \n            -sortOrder \"none\" \n            -longNames 0\n"
		+ "            -niceNames 1\n            -showNamespace 1\n            -showPinIcons 0\n            -mapMotionTrails 0\n            -ignoreHiddenAttribute 0\n            -ignoreOutlinerColor 0\n            -renderFilterVisible 0\n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"graphEditor\" (localizedPanelLabel(\"Graph Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Graph Editor\")) -mbv $menusOkayInPanels  $panelName;\n\n\t\t\t$editorName = ($panelName+\"OutlineEd\");\n            outlinerEditor -e \n                -showShapes 1\n                -showAssignedMaterials 0\n                -showTimeEditor 1\n                -showReferenceNodes 0\n                -showReferenceMembers 0\n                -showAttributes 1\n                -showConnected 1\n                -showAnimCurvesOnly 1\n                -showMuteInfo 0\n                -organizeByLayer 1\n                -organizeByClip 1\n"
		+ "                -showAnimLayerWeight 1\n                -autoExpandLayers 1\n                -autoExpand 1\n                -showDagOnly 0\n                -showAssets 1\n                -showContainedOnly 0\n                -showPublishedAsConnected 0\n                -showParentContainers 0\n                -showContainerContents 0\n                -ignoreDagHierarchy 0\n                -expandConnections 1\n                -showUpstreamCurves 1\n                -showUnitlessCurves 1\n                -showCompounds 0\n                -showLeafs 1\n                -showNumericAttrsOnly 1\n                -highlightActive 0\n                -autoSelectNewObjects 1\n                -doNotSelectNewObjects 0\n                -dropIsParent 1\n                -transmitFilters 1\n                -setFilter \"0\" \n                -showSetMembers 0\n                -allowMultiSelection 1\n                -alwaysToggleSelect 0\n                -directSelect 0\n                -displayMode \"DAG\" \n                -expandObjects 0\n                -setsIgnoreFilters 1\n"
		+ "                -containersIgnoreFilters 0\n                -editAttrName 0\n                -showAttrValues 0\n                -highlightSecondary 0\n                -showUVAttrsOnly 0\n                -showTextureNodesOnly 0\n                -attrAlphaOrder \"default\" \n                -animLayerFilterOptions \"allAffecting\" \n                -sortOrder \"none\" \n                -longNames 0\n                -niceNames 1\n                -showNamespace 1\n                -showPinIcons 1\n                -mapMotionTrails 1\n                -ignoreHiddenAttribute 0\n                -ignoreOutlinerColor 0\n                -renderFilterVisible 0\n                $editorName;\n\n\t\t\t$editorName = ($panelName+\"GraphEd\");\n            animCurveEditor -e \n                -displayValues 0\n                -snapTime \"integer\" \n                -snapValue \"none\" \n                -showPlayRangeShades \"on\" \n                -lockPlayRangeShades \"off\" \n                -smoothness \"fine\" \n                -resultSamples 1\n                -resultScreenSamples 0\n"
		+ "                -resultUpdate \"delayed\" \n                -showUpstreamCurves 1\n                -keyMinScale 1\n                -stackedCurvesMin -1\n                -stackedCurvesMax 1\n                -stackedCurvesSpace 0.2\n                -preSelectionHighlight 0\n                -constrainDrag 0\n                -valueLinesToggle 0\n                -outliner \"graphEditor1OutlineEd\" \n                -highlightAffectedCurves 0\n                $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"dopeSheetPanel\" (localizedPanelLabel(\"Dope Sheet\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Dope Sheet\")) -mbv $menusOkayInPanels  $panelName;\n\n\t\t\t$editorName = ($panelName+\"OutlineEd\");\n            outlinerEditor -e \n                -showShapes 1\n                -showAssignedMaterials 0\n                -showTimeEditor 1\n                -showReferenceNodes 0\n                -showReferenceMembers 0\n"
		+ "                -showAttributes 1\n                -showConnected 1\n                -showAnimCurvesOnly 1\n                -showMuteInfo 0\n                -organizeByLayer 1\n                -organizeByClip 1\n                -showAnimLayerWeight 1\n                -autoExpandLayers 1\n                -autoExpand 0\n                -showDagOnly 0\n                -showAssets 1\n                -showContainedOnly 0\n                -showPublishedAsConnected 0\n                -showParentContainers 0\n                -showContainerContents 0\n                -ignoreDagHierarchy 0\n                -expandConnections 1\n                -showUpstreamCurves 1\n                -showUnitlessCurves 0\n                -showCompounds 1\n                -showLeafs 1\n                -showNumericAttrsOnly 1\n                -highlightActive 0\n                -autoSelectNewObjects 0\n                -doNotSelectNewObjects 1\n                -dropIsParent 1\n                -transmitFilters 0\n                -setFilter \"0\" \n                -showSetMembers 0\n"
		+ "                -allowMultiSelection 1\n                -alwaysToggleSelect 0\n                -directSelect 0\n                -displayMode \"DAG\" \n                -expandObjects 0\n                -setsIgnoreFilters 1\n                -containersIgnoreFilters 0\n                -editAttrName 0\n                -showAttrValues 0\n                -highlightSecondary 0\n                -showUVAttrsOnly 0\n                -showTextureNodesOnly 0\n                -attrAlphaOrder \"default\" \n                -animLayerFilterOptions \"allAffecting\" \n                -sortOrder \"none\" \n                -longNames 0\n                -niceNames 1\n                -showNamespace 1\n                -showPinIcons 0\n                -mapMotionTrails 1\n                -ignoreHiddenAttribute 0\n                -ignoreOutlinerColor 0\n                -renderFilterVisible 0\n                $editorName;\n\n\t\t\t$editorName = ($panelName+\"DopeSheetEd\");\n            dopeSheetEditor -e \n                -displayValues 0\n                -snapTime \"integer\" \n"
		+ "                -snapValue \"none\" \n                -outliner \"dopeSheetPanel1OutlineEd\" \n                -showSummary 1\n                -showScene 0\n                -hierarchyBelow 0\n                -showTicks 1\n                -selectionWindow 0 0 0 0 \n                $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"timeEditorPanel\" (localizedPanelLabel(\"Time Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Time Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"clipEditorPanel\" (localizedPanelLabel(\"Trax Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Trax Editor\")) -mbv $menusOkayInPanels  $panelName;\n\n\t\t\t$editorName = clipEditorNameFromPanel($panelName);\n"
		+ "            clipEditor -e \n                -displayValues 0\n                -snapTime \"none\" \n                -snapValue \"none\" \n                -initialized 0\n                -manageSequencer 0 \n                $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"sequenceEditorPanel\" (localizedPanelLabel(\"Camera Sequencer\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Camera Sequencer\")) -mbv $menusOkayInPanels  $panelName;\n\n\t\t\t$editorName = sequenceEditorNameFromPanel($panelName);\n            clipEditor -e \n                -displayValues 0\n                -snapTime \"none\" \n                -snapValue \"none\" \n                -initialized 0\n                -manageSequencer 1 \n                $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"hyperGraphPanel\" (localizedPanelLabel(\"Hypergraph Hierarchy\")) `;\n"
		+ "\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Hypergraph Hierarchy\")) -mbv $menusOkayInPanels  $panelName;\n\n\t\t\t$editorName = ($panelName+\"HyperGraphEd\");\n            hyperGraph -e \n                -graphLayoutStyle \"hierarchicalLayout\" \n                -orientation \"horiz\" \n                -mergeConnections 0\n                -zoom 1\n                -animateTransition 0\n                -showRelationships 1\n                -showShapes 0\n                -showDeformers 0\n                -showExpressions 0\n                -showConstraints 0\n                -showConnectionFromSelected 0\n                -showConnectionToSelected 0\n                -showConstraintLabels 0\n                -showUnderworld 0\n                -showInvisible 0\n                -transitionFrames 1\n                -opaqueContainers 0\n                -freeform 0\n                -imagePosition 0 0 \n                -imageScale 1\n                -imageEnabled 0\n                -graphType \"DAG\" \n"
		+ "                -heatMapDisplay 0\n                -updateSelection 1\n                -updateNodeAdded 1\n                -useDrawOverrideColor 0\n                -limitGraphTraversal -1\n                -range 0 0 \n                -iconSize \"smallIcons\" \n                -showCachedConnections 0\n                $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"hyperShadePanel\" (localizedPanelLabel(\"Hypershade\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Hypershade\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"visorPanel\" (localizedPanelLabel(\"Visor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Visor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n"
		+ "\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"nodeEditorPanel\" (localizedPanelLabel(\"Node Editor\")) `;\n\tif ($nodeEditorPanelVisible || $nodeEditorWorkspaceControlOpen) {\n\t\tif (\"\" == $panelName) {\n\t\t\tif ($useSceneConfig) {\n\t\t\t\t$panelName = `scriptedPanel -unParent  -type \"nodeEditorPanel\" -l (localizedPanelLabel(\"Node Editor\")) -mbv $menusOkayInPanels `;\n\n\t\t\t$editorName = ($panelName+\"NodeEditorEd\");\n            nodeEditor -e \n                -allAttributes 0\n                -allNodes 0\n                -autoSizeNodes 1\n                -consistentNameSize 1\n                -createNodeCommand \"nodeEdCreateNodeCommand\" \n                -connectNodeOnCreation 0\n                -connectOnDrop 0\n                -copyConnectionsOnPaste 0\n                -connectionStyle \"bezier\" \n                -defaultPinnedState 0\n                -additiveGraphingMode 0\n                -connectedGraphingMode 1\n                -settingsChangedCallback \"nodeEdSyncControls\" \n                -traversalDepthLimit -1\n"
		+ "                -keyPressCommand \"nodeEdKeyPressCommand\" \n                -nodeTitleMode \"name\" \n                -gridSnap 0\n                -gridVisibility 1\n                -crosshairOnEdgeDragging 0\n                -popupMenuScript \"nodeEdBuildPanelMenus\" \n                -showNamespace 1\n                -showShapes 1\n                -showSGShapes 0\n                -showTransforms 1\n                -useAssets 1\n                -syncedSelection 1\n                -extendToShapes 1\n                -showUnitConversions 0\n                -editorMode \"default\" \n                -hasWatchpoint 0\n                $editorName;\n\t\t\t}\n\t\t} else {\n\t\t\t$label = `panel -q -label $panelName`;\n\t\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Node Editor\")) -mbv $menusOkayInPanels  $panelName;\n\n\t\t\t$editorName = ($panelName+\"NodeEditorEd\");\n            nodeEditor -e \n                -allAttributes 0\n                -allNodes 0\n                -autoSizeNodes 1\n                -consistentNameSize 1\n                -createNodeCommand \"nodeEdCreateNodeCommand\" \n"
		+ "                -connectNodeOnCreation 0\n                -connectOnDrop 0\n                -copyConnectionsOnPaste 0\n                -connectionStyle \"bezier\" \n                -defaultPinnedState 0\n                -additiveGraphingMode 0\n                -connectedGraphingMode 1\n                -settingsChangedCallback \"nodeEdSyncControls\" \n                -traversalDepthLimit -1\n                -keyPressCommand \"nodeEdKeyPressCommand\" \n                -nodeTitleMode \"name\" \n                -gridSnap 0\n                -gridVisibility 1\n                -crosshairOnEdgeDragging 0\n                -popupMenuScript \"nodeEdBuildPanelMenus\" \n                -showNamespace 1\n                -showShapes 1\n                -showSGShapes 0\n                -showTransforms 1\n                -useAssets 1\n                -syncedSelection 1\n                -extendToShapes 1\n                -showUnitConversions 0\n                -editorMode \"default\" \n                -hasWatchpoint 0\n                $editorName;\n\t\t\tif (!$useSceneConfig) {\n"
		+ "\t\t\t\tpanel -e -l $label $panelName;\n\t\t\t}\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"createNodePanel\" (localizedPanelLabel(\"Create Node\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Create Node\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"polyTexturePlacementPanel\" (localizedPanelLabel(\"UV Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"UV Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"renderWindowPanel\" (localizedPanelLabel(\"Render View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Render View\")) -mbv $menusOkayInPanels  $panelName;\n"
		+ "\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"shapePanel\" (localizedPanelLabel(\"Shape Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tshapePanel -edit -l (localizedPanelLabel(\"Shape Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"posePanel\" (localizedPanelLabel(\"Pose Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tposePanel -edit -l (localizedPanelLabel(\"Pose Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"dynRelEdPanel\" (localizedPanelLabel(\"Dynamic Relationships\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Dynamic Relationships\")) -mbv $menusOkayInPanels  $panelName;\n"
		+ "\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"relationshipPanel\" (localizedPanelLabel(\"Relationship Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Relationship Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"referenceEditorPanel\" (localizedPanelLabel(\"Reference Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Reference Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"dynPaintScriptedPanelType\" (localizedPanelLabel(\"Paint Effects\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Paint Effects\")) -mbv $menusOkayInPanels  $panelName;\n"
		+ "\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"scriptEditorPanel\" (localizedPanelLabel(\"Script Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Script Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"profilerPanel\" (localizedPanelLabel(\"Profiler Tool\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Profiler Tool\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"contentBrowserPanel\" (localizedPanelLabel(\"Content Browser\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Content Browser\")) -mbv $menusOkayInPanels  $panelName;\n"
		+ "\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"Stereo\" (localizedPanelLabel(\"Stereo\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Stereo\")) -mbv $menusOkayInPanels  $panelName;\n{ string $editorName = ($panelName+\"Editor\");\n            stereoCameraView -e \n                -camera \"|persp\" \n                -useInteractiveMode 0\n                -displayLights \"default\" \n                -displayAppearance \"wireframe\" \n                -activeOnly 0\n                -ignorePanZoom 0\n                -wireframeOnShaded 0\n                -headsUpDisplay 1\n                -holdOuts 1\n                -selectionHiliteDisplay 1\n                -useDefaultMaterial 0\n                -bufferMode \"double\" \n                -twoSidedLighting 1\n                -backfaceCulling 0\n                -xray 0\n                -jointXray 0\n                -activeComponentsXray 0\n                -displayTextures 0\n"
		+ "                -smoothWireframe 0\n                -lineWidth 1\n                -textureAnisotropic 0\n                -textureHilight 1\n                -textureSampling 2\n                -textureDisplay \"modulate\" \n                -textureMaxSize 32768\n                -fogging 0\n                -fogSource \"fragment\" \n                -fogMode \"linear\" \n                -fogStart 0\n                -fogEnd 100\n                -fogDensity 0.1\n                -fogColor 0.5 0.5 0.5 1 \n                -depthOfFieldPreview 1\n                -maxConstantTransparency 1\n                -objectFilterShowInHUD 1\n                -isFiltered 0\n                -colorResolution 4 4 \n                -bumpResolution 4 4 \n                -textureCompression 0\n                -transparencyAlgorithm \"frontAndBackCull\" \n                -transpInShadows 0\n                -cullingOverride \"none\" \n                -lowQualityLighting 0\n                -maximumNumHardwareLights 0\n                -occlusionCulling 0\n                -shadingModel 0\n"
		+ "                -useBaseRenderer 0\n                -useReducedRenderer 0\n                -smallObjectCulling 0\n                -smallObjectThreshold -1 \n                -interactiveDisableShadows 0\n                -interactiveBackFaceCull 0\n                -sortTransparent 1\n                -controllers 1\n                -nurbsCurves 1\n                -nurbsSurfaces 1\n                -polymeshes 1\n                -subdivSurfaces 1\n                -planes 1\n                -lights 1\n                -cameras 1\n                -controlVertices 1\n                -hulls 1\n                -grid 1\n                -imagePlane 1\n                -joints 1\n                -ikHandles 1\n                -deformers 1\n                -dynamics 1\n                -particleInstancers 1\n                -fluids 1\n                -hairSystems 1\n                -follicles 1\n                -nCloths 1\n                -nParticles 1\n                -nRigids 1\n                -dynamicConstraints 1\n                -locators 1\n                -manipulators 1\n"
		+ "                -pluginShapes 1\n                -dimensions 1\n                -handles 1\n                -pivots 1\n                -textures 1\n                -strokes 1\n                -motionTrails 1\n                -clipGhosts 1\n                -greasePencils 0\n                -shadows 0\n                -captureSequenceNumber -1\n                -width 0\n                -height 0\n                -sceneRenderFilter 0\n                -displayMode \"centerEye\" \n                -viewColor 0 0 0 1 \n                -useCustomBackground 1\n                $editorName;\n            stereoCameraView -e -viewSelected 0 $editorName;\n            stereoCameraView -e \n                -pluginObjects \"gpuCacheDisplayFilter\" 1 \n                $editorName; };\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\tif ($useSceneConfig) {\n        string $configName = `getPanel -cwl (localizedPanelLabel(\"Current Layout\"))`;\n        if (\"\" != $configName) {\n\t\t\tpanelConfiguration -edit -label (localizedPanelLabel(\"Current Layout\")) \n"
		+ "\t\t\t\t-userCreated false\n\t\t\t\t-defaultImage \"vacantCell.xP:/\"\n\t\t\t\t-image \"\"\n\t\t\t\t-sc false\n\t\t\t\t-configString \"global string $gMainPane; paneLayout -e -cn \\\"single\\\" -ps 1 100 100 $gMainPane;\"\n\t\t\t\t-removeAllPanels\n\t\t\t\t-ap false\n\t\t\t\t\t(localizedPanelLabel(\"Persp View\")) \n\t\t\t\t\t\"modelPanel\"\n"
		+ "\t\t\t\t\t\"$panelName = `modelPanel -unParent -l (localizedPanelLabel(\\\"Persp View\\\")) -mbv $menusOkayInPanels `;\\n$editorName = $panelName;\\nmodelEditor -e \\n    -cam `findStartUpCamera persp` \\n    -useInteractiveMode 0\\n    -displayLights \\\"default\\\" \\n    -displayAppearance \\\"smoothShaded\\\" \\n    -activeOnly 0\\n    -ignorePanZoom 0\\n    -wireframeOnShaded 0\\n    -headsUpDisplay 1\\n    -holdOuts 1\\n    -selectionHiliteDisplay 1\\n    -useDefaultMaterial 0\\n    -bufferMode \\\"double\\\" \\n    -twoSidedLighting 0\\n    -backfaceCulling 0\\n    -xray 0\\n    -jointXray 0\\n    -activeComponentsXray 0\\n    -displayTextures 1\\n    -smoothWireframe 0\\n    -lineWidth 1\\n    -textureAnisotropic 0\\n    -textureHilight 1\\n    -textureSampling 2\\n    -textureDisplay \\\"modulate\\\" \\n    -textureMaxSize 32768\\n    -fogging 0\\n    -fogSource \\\"fragment\\\" \\n    -fogMode \\\"linear\\\" \\n    -fogStart 0\\n    -fogEnd 100\\n    -fogDensity 0.1\\n    -fogColor 0.5 0.5 0.5 1 \\n    -depthOfFieldPreview 1\\n    -maxConstantTransparency 1\\n    -rendererName \\\"vp2Renderer\\\" \\n    -objectFilterShowInHUD 1\\n    -isFiltered 0\\n    -colorResolution 256 256 \\n    -bumpResolution 512 512 \\n    -textureCompression 0\\n    -transparencyAlgorithm \\\"frontAndBackCull\\\" \\n    -transpInShadows 0\\n    -cullingOverride \\\"none\\\" \\n    -lowQualityLighting 0\\n    -maximumNumHardwareLights 1\\n    -occlusionCulling 0\\n    -shadingModel 0\\n    -useBaseRenderer 0\\n    -useReducedRenderer 0\\n    -smallObjectCulling 0\\n    -smallObjectThreshold -1 \\n    -interactiveDisableShadows 0\\n    -interactiveBackFaceCull 0\\n    -sortTransparent 1\\n    -controllers 1\\n    -nurbsCurves 1\\n    -nurbsSurfaces 1\\n    -polymeshes 1\\n    -subdivSurfaces 1\\n    -planes 1\\n    -lights 1\\n    -cameras 1\\n    -controlVertices 1\\n    -hulls 1\\n    -grid 1\\n    -imagePlane 1\\n    -joints 1\\n    -ikHandles 1\\n    -deformers 1\\n    -dynamics 1\\n    -particleInstancers 1\\n    -fluids 1\\n    -hairSystems 1\\n    -follicles 1\\n    -nCloths 1\\n    -nParticles 1\\n    -nRigids 1\\n    -dynamicConstraints 1\\n    -locators 1\\n    -manipulators 1\\n    -pluginShapes 1\\n    -dimensions 1\\n    -handles 1\\n    -pivots 1\\n    -textures 1\\n    -strokes 1\\n    -motionTrails 1\\n    -clipGhosts 1\\n    -greasePencils 0\\n    -shadows 0\\n    -captureSequenceNumber -1\\n    -width 2639\\n    -height 1102\\n    -sceneRenderFilter 0\\n    $editorName;\\nmodelEditor -e -viewSelected 0 $editorName;\\nmodelEditor -e \\n    -pluginObjects \\\"gpuCacheDisplayFilter\\\" 1 \\n    $editorName\"\n"
		+ "\t\t\t\t\t\"modelPanel -edit -l (localizedPanelLabel(\\\"Persp View\\\")) -mbv $menusOkayInPanels  $panelName;\\n$editorName = $panelName;\\nmodelEditor -e \\n    -cam `findStartUpCamera persp` \\n    -useInteractiveMode 0\\n    -displayLights \\\"default\\\" \\n    -displayAppearance \\\"smoothShaded\\\" \\n    -activeOnly 0\\n    -ignorePanZoom 0\\n    -wireframeOnShaded 0\\n    -headsUpDisplay 1\\n    -holdOuts 1\\n    -selectionHiliteDisplay 1\\n    -useDefaultMaterial 0\\n    -bufferMode \\\"double\\\" \\n    -twoSidedLighting 0\\n    -backfaceCulling 0\\n    -xray 0\\n    -jointXray 0\\n    -activeComponentsXray 0\\n    -displayTextures 1\\n    -smoothWireframe 0\\n    -lineWidth 1\\n    -textureAnisotropic 0\\n    -textureHilight 1\\n    -textureSampling 2\\n    -textureDisplay \\\"modulate\\\" \\n    -textureMaxSize 32768\\n    -fogging 0\\n    -fogSource \\\"fragment\\\" \\n    -fogMode \\\"linear\\\" \\n    -fogStart 0\\n    -fogEnd 100\\n    -fogDensity 0.1\\n    -fogColor 0.5 0.5 0.5 1 \\n    -depthOfFieldPreview 1\\n    -maxConstantTransparency 1\\n    -rendererName \\\"vp2Renderer\\\" \\n    -objectFilterShowInHUD 1\\n    -isFiltered 0\\n    -colorResolution 256 256 \\n    -bumpResolution 512 512 \\n    -textureCompression 0\\n    -transparencyAlgorithm \\\"frontAndBackCull\\\" \\n    -transpInShadows 0\\n    -cullingOverride \\\"none\\\" \\n    -lowQualityLighting 0\\n    -maximumNumHardwareLights 1\\n    -occlusionCulling 0\\n    -shadingModel 0\\n    -useBaseRenderer 0\\n    -useReducedRenderer 0\\n    -smallObjectCulling 0\\n    -smallObjectThreshold -1 \\n    -interactiveDisableShadows 0\\n    -interactiveBackFaceCull 0\\n    -sortTransparent 1\\n    -controllers 1\\n    -nurbsCurves 1\\n    -nurbsSurfaces 1\\n    -polymeshes 1\\n    -subdivSurfaces 1\\n    -planes 1\\n    -lights 1\\n    -cameras 1\\n    -controlVertices 1\\n    -hulls 1\\n    -grid 1\\n    -imagePlane 1\\n    -joints 1\\n    -ikHandles 1\\n    -deformers 1\\n    -dynamics 1\\n    -particleInstancers 1\\n    -fluids 1\\n    -hairSystems 1\\n    -follicles 1\\n    -nCloths 1\\n    -nParticles 1\\n    -nRigids 1\\n    -dynamicConstraints 1\\n    -locators 1\\n    -manipulators 1\\n    -pluginShapes 1\\n    -dimensions 1\\n    -handles 1\\n    -pivots 1\\n    -textures 1\\n    -strokes 1\\n    -motionTrails 1\\n    -clipGhosts 1\\n    -greasePencils 0\\n    -shadows 0\\n    -captureSequenceNumber -1\\n    -width 2639\\n    -height 1102\\n    -sceneRenderFilter 0\\n    $editorName;\\nmodelEditor -e -viewSelected 0 $editorName;\\nmodelEditor -e \\n    -pluginObjects \\\"gpuCacheDisplayFilter\\\" 1 \\n    $editorName\"\n"
		+ "\t\t\t\t$configName;\n\n            setNamedPanelLayout (localizedPanelLabel(\"Current Layout\"));\n        }\n\n        panelHistory -e -clear mainPanelHistory;\n        sceneUIReplacement -clear;\n\t}\n\n\ngrid -spacing 5 -size 12 -divisions 5 -displayAxes yes -displayGridLines yes -displayDivisionLines yes -displayPerspectiveLabels no -displayOrthographicLabels no -displayAxesBold yes -perspectiveLabelPosition axis -orthographicLabelPosition edge;\nviewManip -drawCompass 0 -compassAngle 0 -frontParameters \"\" -homeParameters \"\" -selectionLockParameters \"\";\n}\n");
	setAttr ".st" 3;
createNode script -n "sceneConfigurationScriptNode";
	rename -uid "2A699F76-4FE0-B39B-42AC-FCBB8BB1B362";
	setAttr ".b" -type "string" "playbackOptions -min 1 -max 120 -ast 1 -aet 200 ";
	setAttr ".st" 6;
createNode groupId -n "groupId1";
	rename -uid "29C0B976-4E06-D8EF-F46F-EFA6AB72C464";
	setAttr ".ihi" 0;
createNode lambert -n "lambert2";
	rename -uid "5C0F800C-4D1A-9F26-CC8D-B29C0A9B25A8";
createNode shadingEngine -n "lambert2SG";
	rename -uid "BD1E876B-4574-47B2-493E-B8B5503E8FB7";
	setAttr ".ihi" 0;
	setAttr ".ro" yes;
createNode materialInfo -n "materialInfo1";
	rename -uid "7A0209AC-477B-7A49-E27B-238DF1300A32";
createNode lambert -n "lambert3";
	rename -uid "50989129-4BD4-3C9E-E4D6-CC9667560D7C";
createNode shadingEngine -n "lambert3SG";
	rename -uid "0D6537FB-4024-AF00-82C5-02AA0AAD04B9";
	setAttr ".ihi" 0;
	setAttr ".ro" yes;
createNode materialInfo -n "materialInfo2";
	rename -uid "E688FE0D-4E29-9AA1-4D6F-8AAB55E8C7D3";
createNode file -n "file1";
	rename -uid "D963A544-442E-B883-397F-429049F75734";
	setAttr ".ftn" -type "string" "P:/Dropbox/$Gumroad_Store/RIGS/BOUNCYRACOON/sourceimages/cbHat_texture.jpg";
	setAttr ".ft" 0;
	setAttr ".cs" -type "string" "sRGB";
createNode place2dTexture -n "place2dTexture1";
	rename -uid "EAE3D4C0-48CD-D7AA-8B63-078236F10F29";
createNode polyNormal -n "polyNormal1";
	rename -uid "52E41FFD-40C3-41B0-0E5E-7F91527D9530";
	setAttr ".ics" -type "componentList" 1 "f[*]";
	setAttr ".unm" no;
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
	setAttr -s 4 ".st";
select -ne :renderGlobalsList1;
select -ne :defaultShaderList1;
	setAttr -s 7 ".s";
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
	setAttr ".otn" -type "string" "ACES 1.0 SDR-video (sRGB)";
	setAttr ".potn" -type "string" "ACES 1.0 SDR-video (sRGB)";
select -ne :hardwareRenderGlobals;
	setAttr ".ctrs" 256;
	setAttr ".btrs" 512;
connectAttr "cb_hat_mesh_grp_parentConstraint1.ctx" "cb_hat_mesh_grp.tx";
connectAttr "cb_hat_mesh_grp_parentConstraint1.cty" "cb_hat_mesh_grp.ty";
connectAttr "cb_hat_mesh_grp_parentConstraint1.ctz" "cb_hat_mesh_grp.tz";
connectAttr "cb_hat_mesh_grp_parentConstraint1.crx" "cb_hat_mesh_grp.rx";
connectAttr "cb_hat_mesh_grp_parentConstraint1.cry" "cb_hat_mesh_grp.ry";
connectAttr "cb_hat_mesh_grp_parentConstraint1.crz" "cb_hat_mesh_grp.rz";
connectAttr "cb_hat_mesh_grp_scaleConstraint1.csx" "cb_hat_mesh_grp.sx";
connectAttr "cb_hat_mesh_grp_scaleConstraint1.csy" "cb_hat_mesh_grp.sy";
connectAttr "cb_hat_mesh_grp_scaleConstraint1.csz" "cb_hat_mesh_grp.sz";
connectAttr "polyNormal1.out" "cb_hat_meshShape.i";
connectAttr "cb_hat_mesh_grp.ro" "cb_hat_mesh_grp_parentConstraint1.cro";
connectAttr "cb_hat_mesh_grp.pim" "cb_hat_mesh_grp_parentConstraint1.cpim";
connectAttr "cb_hat_mesh_grp.rp" "cb_hat_mesh_grp_parentConstraint1.crp";
connectAttr "cb_hat_mesh_grp.rpt" "cb_hat_mesh_grp_parentConstraint1.crt";
connectAttr "cbhat_ctrl_02.t" "cb_hat_mesh_grp_parentConstraint1.tg[0].tt";
connectAttr "cbhat_ctrl_02.rp" "cb_hat_mesh_grp_parentConstraint1.tg[0].trp";
connectAttr "cbhat_ctrl_02.rpt" "cb_hat_mesh_grp_parentConstraint1.tg[0].trt";
connectAttr "cbhat_ctrl_02.r" "cb_hat_mesh_grp_parentConstraint1.tg[0].tr";
connectAttr "cbhat_ctrl_02.ro" "cb_hat_mesh_grp_parentConstraint1.tg[0].tro";
connectAttr "cbhat_ctrl_02.s" "cb_hat_mesh_grp_parentConstraint1.tg[0].ts";
connectAttr "cbhat_ctrl_02.pm" "cb_hat_mesh_grp_parentConstraint1.tg[0].tpm";
connectAttr "cb_hat_mesh_grp_parentConstraint1.w0" "cb_hat_mesh_grp_parentConstraint1.tg[0].tw"
		;
connectAttr "cb_hat_mesh_grp.pim" "cb_hat_mesh_grp_scaleConstraint1.cpim";
connectAttr "cbhat_ctrl_02.s" "cb_hat_mesh_grp_scaleConstraint1.tg[0].ts";
connectAttr "cbhat_ctrl_02.pm" "cb_hat_mesh_grp_scaleConstraint1.tg[0].tpm";
connectAttr "cb_hat_mesh_grp_scaleConstraint1.w0" "cb_hat_mesh_grp_scaleConstraint1.tg[0].tw"
		;
relationship "link" ":lightLinker1" ":initialShadingGroup.message" ":defaultLightSet.message";
relationship "link" ":lightLinker1" ":initialParticleSE.message" ":defaultLightSet.message";
relationship "link" ":lightLinker1" "lambert2SG.message" ":defaultLightSet.message";
relationship "link" ":lightLinker1" "lambert3SG.message" ":defaultLightSet.message";
relationship "shadowLink" ":lightLinker1" ":initialShadingGroup.message" ":defaultLightSet.message";
relationship "shadowLink" ":lightLinker1" ":initialParticleSE.message" ":defaultLightSet.message";
relationship "shadowLink" ":lightLinker1" "lambert2SG.message" ":defaultLightSet.message";
relationship "shadowLink" ":lightLinker1" "lambert3SG.message" ":defaultLightSet.message";
connectAttr "layerManager.dli[0]" "defaultLayer.id";
connectAttr "renderLayerManager.rlmi[0]" "defaultRenderLayer.rlid";
connectAttr "lambert2.oc" "lambert2SG.ss";
connectAttr "lambert2SG.msg" "materialInfo1.sg";
connectAttr "lambert2.msg" "materialInfo1.m";
connectAttr "file1.oc" "lambert3.c";
connectAttr "lambert3.oc" "lambert3SG.ss";
connectAttr "cb_hat_meshShape.iog" "lambert3SG.dsm" -na;
connectAttr "lambert3SG.msg" "materialInfo2.sg";
connectAttr "lambert3.msg" "materialInfo2.m";
connectAttr "file1.msg" "materialInfo2.t" -na;
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
connectAttr "polySurfaceShape1.o" "polyNormal1.ip";
connectAttr "lambert2SG.pa" ":renderPartition.st" -na;
connectAttr "lambert3SG.pa" ":renderPartition.st" -na;
connectAttr "lambert2.msg" ":defaultShaderList1.s" -na;
connectAttr "lambert3.msg" ":defaultShaderList1.s" -na;
connectAttr "place2dTexture1.msg" ":defaultRenderUtilityList1.u" -na;
connectAttr "defaultRenderLayer.msg" ":defaultRenderingList1.r" -na;
connectAttr "file1.msg" ":defaultTextureList1.tx" -na;
// End of Hat_rig_01.ma
