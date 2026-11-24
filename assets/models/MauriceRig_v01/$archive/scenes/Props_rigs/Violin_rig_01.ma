//Maya ASCII 2022 scene
//Name: Violin_rig_01.ma
//Last modified: Mon, May 16, 2022 09:14:19 PM
//Codeset: 1252
requires maya "2022";
requires "stereoCamera" "10.0";
requires -nodeType "aiOptions" -nodeType "aiAOVDriver" -nodeType "aiAOVFilter" "mtoa" "5.0.0.1";
currentUnit -l centimeter -a degree -t film;
fileInfo "application" "maya";
fileInfo "product" "Maya 2022";
fileInfo "version" "2022";
fileInfo "cutIdentifier" "202110272215-ad32f8f1e6";
fileInfo "osv" "Windows 10 Home v2009 (Build: 19043)";
fileInfo "UUID" "1B315EC8-4A3C-F9EB-4DCF-C894C4EE51A3";
createNode transform -s -n "persp";
	rename -uid "D0FE08EB-4721-508D-3089-17B041D03DC8";
	setAttr ".v" no;
	setAttr ".t" -type "double3" 5.7350622364111725 22.860659420458397 53.900458568583545 ;
	setAttr ".r" -type "double3" -11.738352731015215 718.59999999995989 0 ;
createNode camera -s -n "perspShape" -p "persp";
	rename -uid "D0EB3FA5-4B2A-7662-F9A3-3A94544D879A";
	setAttr -k off ".v" no;
	setAttr ".fl" 34.999999999999993;
	setAttr ".coi" 57.395459462104981;
	setAttr ".imn" -type "string" "persp";
	setAttr ".den" -type "string" "persp_depth";
	setAttr ".man" -type "string" "persp_mask";
	setAttr ".tp" -type "double3" 3.6450799899726163 11.409456232235454 0.99999999999999978 ;
	setAttr ".hc" -type "string" "viewSet -p %camera";
	setAttr ".ai_translator" -type "string" "perspective";
createNode transform -s -n "top";
	rename -uid "15D43140-4157-F02A-AB66-498EE7622730";
	setAttr ".v" no;
	setAttr ".t" -type "double3" 0 1000.1 0 ;
	setAttr ".r" -type "double3" -90 0 0 ;
createNode camera -s -n "topShape" -p "top";
	rename -uid "1560C628-4DD7-CEE3-F890-51AF4363AF6A";
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
	rename -uid "7158112B-4186-C5C5-9169-8C99E85BCFA4";
	setAttr ".v" no;
	setAttr ".t" -type "double3" -0.82720834722116376 13.108644185766771 1000.1257931202798 ;
createNode camera -s -n "frontShape" -p "front";
	rename -uid "93F727F4-4E03-4F0C-BB5F-25A7B65E2C38";
	setAttr -k off ".v" no;
	setAttr ".rnd" no;
	setAttr ".coi" 999.55618562401821;
	setAttr ".ow" 24.125319316213496;
	setAttr ".imn" -type "string" "front";
	setAttr ".den" -type "string" "front_depth";
	setAttr ".man" -type "string" "front_mask";
	setAttr ".tp" -type "double3" 0.036116190254688263 17.702677726745605 0.56960749626159668 ;
	setAttr ".hc" -type "string" "viewSet -f %camera";
	setAttr ".o" yes;
	setAttr ".ai_translator" -type "string" "orthographic";
createNode transform -s -n "side";
	rename -uid "557D34CF-4703-19A0-E79A-1E9EA07A3595";
	setAttr ".v" no;
	setAttr ".t" -type "double3" 1000.1 0 0 ;
	setAttr ".r" -type "double3" 0 90 0 ;
createNode camera -s -n "sideShape" -p "side";
	rename -uid "87105951-46CE-2B7C-708E-5987D395C4AD";
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
createNode transform -n "Violin_arch_all";
	rename -uid "93B1B6A7-480B-2967-405A-0B80FEBA1174";
createNode transform -n "Violin_arch_mesh" -p "Violin_arch_all";
	rename -uid "8D9B70BF-44F3-9CE1-D4E3-1D8DA676652C";
createNode transform -n "Violin_arch" -p "Violin_arch_mesh";
	rename -uid "082E5BEB-4936-0F06-F7EB-07AFFA4FD701";
	setAttr ".t" -type "double3" 0 7.7355767157382616 1.7522079201380918 ;
createNode mesh -n "Violin_archShape" -p "Violin_arch";
	rename -uid "FB634B72-49AC-6926-F01F-CB82C1949F40";
	setAttr -k off ".v";
	setAttr ".ovdt" 2;
	setAttr ".ove" yes;
	setAttr ".vir" yes;
	setAttr ".vif" yes;
	setAttr -s 6 ".gtag";
	setAttr ".gtag[0].gtagnm" -type "string" "back";
	setAttr ".gtag[0].gtagcmp" -type "componentList" 1 "f[2]";
	setAttr ".gtag[1].gtagnm" -type "string" "bottom";
	setAttr ".gtag[1].gtagcmp" -type "componentList" 1 "f[3]";
	setAttr ".gtag[2].gtagnm" -type "string" "front";
	setAttr ".gtag[2].gtagcmp" -type "componentList" 1 "f[0]";
	setAttr ".gtag[3].gtagnm" -type "string" "left";
	setAttr ".gtag[3].gtagcmp" -type "componentList" 1 "f[5]";
	setAttr ".gtag[4].gtagnm" -type "string" "right";
	setAttr ".gtag[4].gtagcmp" -type "componentList" 1 "f[4]";
	setAttr ".gtag[5].gtagnm" -type "string" "top";
	setAttr ".gtag[5].gtagcmp" -type "componentList" 1 "f[1]";
	setAttr ".pv" -type "double2" 0.89369235294104987 0.75732398692231917 ;
	setAttr ".uvst[0].uvsn" -type "string" "map1";
	setAttr -s 30 ".uvst[0].uvsp[0:29]" -type "float2" 0.86794364 0.64241582
		 0.91281068 0.64241582 0.86794364 0.69665062 0.91281068 0.69665062 0.86794364 0.73097134
		 0.91281068 0.73097134 0.86794364 0.84828383 0.91281068 0.84828383 0.86794364 0.87223208
		 0.91281068 0.87223208 0.94441706 0.64241582 0.94441706 0.69502616 0.84296763 0.64241582
		 0.84296763 0.69502616 0.86794364 0.64241582 0.91281068 0.64241582 0.91281068 0.69502616
		 0.86794364 0.69502616 0.91281068 0.69502616 0.86794364 0.69502616 0.86794364 0.69502616
		 0.91281068 0.69502616 0.86794364 0.69502616 0.86794364 0.69502616 0.91281068 0.69502616
		 0.91281068 0.69502616 0.91281068 0.69502616 0.86794364 0.69502616 0.86794364 0.69502616
		 0.91281068 0.69502616;
	setAttr ".cuvs" -type "string" "map1";
	setAttr ".dcc" -type "string" "Ambient+Diffuse";
	setAttr ".covm[0]"  0 1 1;
	setAttr ".cdvm[0]"  0 1 1;
	setAttr -s 24 ".pt[0:23]" -type "float3"  0.39405647 0 -0.20652094 
		-0.39405647 0 -0.20652094 0.39405647 0 -0.20652094 -0.39405647 0 -0.20652094 0.39405647 
		0 0.33029377 -0.39405647 0 0.33029377 0.39405647 0 0.33029377 -0.39405647 0 0.33029377 
		0.39405647 0 -0.62634695 -0.39405647 0 -0.62634695 -0.39405647 0 -0.62634695 0.39405647 
		0 -0.62634695 0.39405644 0 -0.20652094 -0.39405644 0 -0.20652094 0.39405644 0 -0.62634695 
		-0.39405644 0 -0.62634695 0.39405644 0 -0.62634695 0.39405644 0 -0.20652094 -0.39405644 
		0 -0.20652094 -0.39405644 0 -0.62634695 0.39405644 0 -0.66970623 -0.39405644 0 -0.66970623 
		0.39405644 0 -0.66970623 -0.39405644 0 -0.66970623;
	setAttr -s 24 ".vt[0:23]"  -0.5 -0.5 0.5 0.5 -0.5 0.5 -0.5 0.5 0.5 0.5 0.5 0.5
		 -0.5 0.5 -0.5 0.5 0.5 -0.5 -0.5 -0.5 -0.5 0.5 -0.5 -0.5 -0.5 -0.5 1.12764239 0.5 -0.5 1.12764239
		 0.5 0.5 1.12764239 -0.5 0.5 1.12764239 -0.49999997 8.99016571 0.5 0.49999997 8.99016571 0.5
		 -0.49999997 8.99016571 1.12764239 0.49999997 8.99016571 1.12764239 -0.49999997 8.52732086 1.12764239
		 -0.49999997 8.52732086 0.5 0.49999997 8.52732086 0.5 0.49999997 8.52732086 1.12764239
		 -0.49999997 8.52732086 0.5 0.49999997 8.52732086 0.5 -0.49999997 8.99016571 0.5 0.49999997 8.99016571 0.5;
	setAttr -s 44 ".ed[0:43]"  0 1 0 2 3 0 4 5 0 6 7 0 0 2 0 1 3 0 2 4 0
		 3 5 0 4 6 0 5 7 0 6 0 0 7 1 0 0 8 0 1 9 0 8 9 0 3 10 0 9 10 0 2 11 0 11 10 0 8 11 0
		 2 17 0 3 18 0 12 13 0 11 16 0 12 14 0 10 19 0 14 15 0 13 15 0 16 14 0 17 12 0 16 17 1
		 18 13 0 17 18 0 19 15 0 18 19 1 19 16 1 17 20 0 18 21 0 20 21 0 12 22 0 20 22 0 13 23 0
		 22 23 0 21 23 0;
	setAttr -s 22 -ch 88 ".fc[0:21]" -type "polyFaces" 
		f 4 14 16 -19 -20
		mu 0 4 14 15 16 17
		f 4 1 7 -3 -7
		mu 0 4 2 3 5 4
		f 4 2 9 -4 -9
		mu 0 4 4 5 7 6
		f 4 3 11 -1 -11
		mu 0 4 6 7 9 8
		f 4 -12 -10 -8 -6
		mu 0 4 1 10 11 3
		f 4 10 4 6 8
		mu 0 4 12 0 2 13
		f 4 0 13 -15 -13
		mu 0 4 0 1 15 14
		f 4 5 15 -17 -14
		mu 0 4 1 3 16 15
		f 4 -23 24 26 -28
		mu 0 4 18 19 20 21
		f 4 -5 12 19 -18
		mu 0 4 2 0 14 17
		f 4 -2 20 32 -22
		mu 0 4 3 2 23 24
		f 4 17 23 30 -21
		mu 0 4 2 17 22 23
		f 4 18 25 35 -24
		mu 0 4 17 16 25 22
		f 4 -16 21 34 -26
		mu 0 4 16 3 24 25
		f 4 -31 28 -25 -30
		mu 0 4 23 22 20 19
		f 4 -39 40 42 -44
		mu 0 4 26 27 28 29
		f 4 -35 31 27 -34
		mu 0 4 25 24 18 21
		f 4 -36 33 -27 -29
		mu 0 4 22 25 21 20
		f 4 -33 36 38 -38
		mu 0 4 24 23 27 26
		f 4 29 39 -41 -37
		mu 0 4 23 19 28 27
		f 4 22 41 -43 -40
		mu 0 4 19 18 29 28
		f 4 -32 37 43 -42
		mu 0 4 18 24 26 29;
	setAttr ".cd" -type "dataPolyComponent" Index_Data Edge 0 ;
	setAttr ".cvd" -type "dataPolyComponent" Index_Data Vertex 0 ;
	setAttr ".pd[0]" -type "dataPolyComponent" Index_Data UV 0 ;
	setAttr ".hfd" -type "dataPolyComponent" Index_Data Face 0 ;
	setAttr ".ai_translator" -type "string" "polymesh";
createNode transform -n "Violin_arch_string" -p "Violin_arch_mesh";
	rename -uid "8588F191-4D22-4782-145E-C3874B3D6C7C";
	setAttr ".t" -type "double3" 0 8.706979683207571 1.6722539846947375 ;
	setAttr ".r" -type "double3" 90 0 0 ;
createNode mesh -n "Violin_arch_stringShape" -p "Violin_arch_string";
	rename -uid "65E9CD9B-4839-CD5D-B081-30B8FC58ADF5";
	setAttr -k off ".v";
	setAttr ".ovdt" 2;
	setAttr ".ove" yes;
	setAttr ".vir" yes;
	setAttr ".vif" yes;
	setAttr -s 5 ".gtag";
	setAttr ".gtag[0].gtagnm" -type "string" "back";
	setAttr ".gtag[0].gtagcmp" -type "componentList" 1 "e[3]";
	setAttr ".gtag[1].gtagnm" -type "string" "front";
	setAttr ".gtag[1].gtagcmp" -type "componentList" 1 "e[0]";
	setAttr ".gtag[2].gtagnm" -type "string" "left";
	setAttr ".gtag[2].gtagcmp" -type "componentList" 1 "e[1]";
	setAttr ".gtag[3].gtagnm" -type "string" "right";
	setAttr ".gtag[3].gtagcmp" -type "componentList" 1 "e[2]";
	setAttr ".gtag[4].gtagnm" -type "string" "rim";
	setAttr ".gtag[4].gtagcmp" -type "componentList" 1 "e[0:3]";
	setAttr ".pv" -type "double2" 0.5 1 ;
	setAttr ".uvst[0].uvsn" -type "string" "map1";
	setAttr -s 4 ".uvst[0].uvsp[0:3]" -type "float2" 0 0 1 0 0 1 1 1;
	setAttr ".cuvs" -type "string" "map1";
	setAttr ".dcc" -type "string" "Ambient+Diffuse";
	setAttr ".covm[0]"  0 1 1;
	setAttr ".cdvm[0]"  0 1 1;
	setAttr -s 4 ".pt[0:3]" -type "float3"  0.40936795 0 0 -0.40936795 
		0 0 0.40936795 2.220446e-16 -7.0597372 -0.40936795 2.220446e-16 -7.0597372;
	setAttr -s 4 ".vt[0:3]"  -0.5 0 0.5 0.5 0 0.5 -0.5 0 -0.5 0.5 0 -0.5;
	setAttr -s 4 ".ed[0:3]"  0 1 0 0 2 0 1 3 0 2 3 0;
	setAttr -ch 4 ".fc[0]" -type "polyFaces" 
		f 4 0 2 -4 -2
		mu 0 4 0 1 3 2;
	setAttr ".cd" -type "dataPolyComponent" Index_Data Edge 0 ;
	setAttr ".cvd" -type "dataPolyComponent" Index_Data Vertex 0 ;
	setAttr ".pd[0]" -type "dataPolyComponent" Index_Data UV 0 ;
	setAttr ".hfd" -type "dataPolyComponent" Index_Data Face 0 ;
	setAttr ".ai_translator" -type "string" "polymesh";
createNode parentConstraint -n "Violin_arch_mesh_parentConstraint1" -p "Violin_arch_mesh";
	rename -uid "F57E45A5-46BF-A7D3-DF08-AC901C991B4C";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "Violinarch_ctrl02W0" -dv 1 -min 0 
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
	setAttr ".tg[0].tot" -type "double3" 0 -11.976206130352406 -2.1413603670774091 ;
	setAttr -k on ".w0";
createNode scaleConstraint -n "Violin_arch_mesh_scaleConstraint1" -p "Violin_arch_mesh";
	rename -uid "FFB3578B-4D26-799A-D089-D5ACE4EF1D86";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "Violinarch_ctrl02W0" -dv 1 -min 0 
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
createNode transform -n "Violinarch_ctrl_main_offset" -p "Violin_arch_all";
	rename -uid "F329C432-40D9-151D-2F1A-F5BB75A76210";
	setAttr ".t" -type "double3" -3.6450799899726158 0.56683273762586761 4.4408920985006262e-16 ;
	setAttr ".rp" -type "double3" 3.6450799899726158 -0.56683273762586761 -4.4408920985006262e-16 ;
	setAttr ".sp" -type "double3" 3.6450799899726158 -0.56683273762586761 -4.4408920985006262e-16 ;
createNode transform -n "Violinarch_ctrl_main" -p "Violinarch_ctrl_main_offset";
	rename -uid "01716074-4445-3E85-220F-6C9E6A8EC097";
	setAttr ".t" -type "double3" 6.8569120927645617 11.028342031911736 5.9164567891575885e-31 ;
	setAttr ".rp" -type "double3" 3.6450799899726158 -0.56679975479424272 0 ;
	setAttr ".sp" -type "double3" 3.6450799899726158 -0.56679975479424272 0 ;
createNode nurbsCurve -n "Violinarch_ctrl_mainShape" -p "Violinarch_ctrl_main";
	rename -uid "3514FAF5-4BF8-2E6B-5425-5CBCA95E9EA4";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 14;
	setAttr ".cc" -type "nurbsCurve" 
		1 4 0 no 3
		5 0 1.4142135623730949 2.8284271247461898 4.2426406871192848 5.6568542494923797
		
		5
		1.4567916041526547 -0.56679975479424238 -2.1882883858199609
		1.4567916041526547 -0.56679975479424272 2.1882883858199609
		5.8333683757925749 -0.56679975479424305 2.1882883858199604
		5.8333683757925767 -0.56679975479424272 -2.1882883858199595
		1.4567916041526552 -0.56679975479424238 -2.1882883858199618
		;
createNode transform -n "Violinarch_ctrl01_offset" -p "Violinarch_ctrl_main";
	rename -uid "2ED8A7CB-41E4-281F-2D75-8797D8B86921";
	setAttr ".t" -type "double3" 3.6450799899726158 -0.56686572045749273 0.00065699316134470997 ;
	setAttr ".s" -type "double3" 1.3231058873991604 1.3231058873991604 1.3231058873991604 ;
	setAttr ".rp" -type "double3" 0 0 -0.00030311968018514234 ;
	setAttr ".sp" -type "double3" 0 0 -0.00022909706855056555 ;
	setAttr ".spt" -type "double3" 0 0 -7.4022611634576784e-05 ;
createNode transform -n "Violinarch_ctrl01" -p "Violinarch_ctrl01_offset";
	rename -uid "8373E1E6-4B22-28FE-B9BC-8E9B70F9350F";
	setAttr ".rp" -type "double3" 0 0 -0.00022909706855056555 ;
	setAttr ".sp" -type "double3" 0 0 -0.00022909706855056555 ;
createNode nurbsCurve -n "Violinarch_ctrlShape1" -p "Violinarch_ctrl01";
	rename -uid "CB934EED-4CE8-F005-78A6-78B41F25E2D0";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 17;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		0.95429252028227618 4.7982373409884731e-17 -0.95452161735082741
		8.2637538735866876e-17 6.7857323231109122e-17 -1.3498025217229479
		-0.95429252028227618 4.7982373409884719e-17 -0.95452161735082697
		-1.3495734246543969 3.5177356190060272e-33 -0.00022909706855103013
		-0.95429252028227618 -4.7982373409884725e-17 0.95406342321372539
		-1.3518769296315945e-16 -6.7857323231109171e-17 1.3493443275858465
		0.95429252028227618 -4.7982373409884719e-17 0.95406342321372539
		1.3495734246543969 -9.2536792101100989e-33 -0.00022909706855077613
		0.95429252028227618 4.7982373409884731e-17 -0.95452161735082741
		8.2637538735866876e-17 6.7857323231109122e-17 -1.3498025217229479
		-0.95429252028227618 4.7982373409884719e-17 -0.95452161735082697
		;
createNode transform -n "Violinarch_ctrl02_offset" -p "Violinarch_ctrl01";
	rename -uid "C1000604-440B-65A1-F660-A5BD4F7CAD34";
	setAttr ".rp" -type "double3" 0 0 -0.00022909706855056555 ;
	setAttr ".sp" -type "double3" 0 0 -0.00022909706855056555 ;
createNode transform -n "Violinarch_ctrl02" -p "Violinarch_ctrl02_offset";
	rename -uid "59F25FAF-463D-51C2-0C97-9CA7E7249616";
	setAttr ".rp" -type "double3" 0 0 -0.00022909706855056555 ;
	setAttr ".sp" -type "double3" 0 0 -0.00022909706855056555 ;
createNode nurbsCurve -n "Violinarch_ctrlShape2" -p "Violinarch_ctrl02";
	rename -uid "DD841D37-4AE3-3134-562F-548A73AB85EA";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 17;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		0.81884011469614926 4.7982373409884731e-17 -0.81906921176470038
		7.090795564096959e-17 6.7857323231109122e-17 -1.158243892686986
		-0.81884011469614926 4.7982373409884719e-17 -0.81906921176470004
		-1.158014795618435 3.5177356190060272e-33 -0.00022909706855099232
		-0.81884011469614926 -4.7982373409884725e-17 0.81861101762759847
		-1.1599913407968188e-16 -6.7857323231109171e-17 1.1577856985498847
		0.81884011469614926 -4.7982373409884719e-17 0.81861101762759847
		1.158014795618435 -9.2536792101100989e-33 -0.00022909706855077437
		0.81884011469614926 4.7982373409884731e-17 -0.81906921176470038
		7.090795564096959e-17 6.7857323231109122e-17 -1.158243892686986
		-0.81884011469614926 4.7982373409884719e-17 -0.81906921176470004
		;
createNode transform -n "Violin_all";
	rename -uid "1ABDFEC7-484A-A643-0C42-5CA717013535";
createNode transform -n "Violin_ctrl_main_offset" -p "Violin_all";
	rename -uid "6FCC730A-4686-1AD8-4DAF-2FB37DB24762";
	setAttr ".t" -type "double3" 0.80298198541061039 0.56683273762586761 4.4408920985006262e-16 ;
	setAttr ".rp" -type "double3" -0.80298198541061039 -0.56683273762586761 -4.4408920985006262e-16 ;
	setAttr ".sp" -type "double3" -0.80298198541061039 -0.56683273762586761 -4.4408920985006262e-16 ;
createNode transform -n "Violin_ctrl_main" -p "Violin_ctrl_main_offset";
	rename -uid "17F63612-4E11-6766-4592-F2B598580A63";
	setAttr ".t" -type "double3" 0 11.177041085524964 0 ;
	setAttr ".rp" -type "double3" -0.80298198541061083 -0.56679975479424272 0 ;
	setAttr ".sp" -type "double3" -0.80298198541061083 -0.56679975479424272 0 ;
createNode nurbsCurve -n "Violin_ctrl_mainShape" -p "Violin_ctrl_main";
	rename -uid "4DA36174-4C88-03C0-31BD-22B710A33E09";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 14;
	setAttr ".cc" -type "nurbsCurve" 
		1 4 0 no 3
		5 0 1.4142135623730949 2.8284271247461898 4.2426406871192848 5.6568542494923797
		
		5
		-4.8657066061534424 -0.56679975479424238 -4.0627246207428307
		-4.8657066061534424 -0.56679975479424272 4.0627246207428307
		3.2597426353322199 -0.56679975479424305 4.0627246207428316
		3.2597426353322216 -0.56679975479424272 -4.0627246207428307
		-4.8657066061534415 -0.56679975479424238 -4.0627246207428325
		;
createNode transform -n "Violin_ctrl01_offset" -p "Violin_ctrl_main";
	rename -uid "66E008B5-4F31-7EA6-4D96-108C7861788D";
	setAttr ".t" -type "double3" -0.80298198541061083 -0.56686572045749273 0.00065699316134465446 ;
	setAttr ".s" -type "double3" 1.3231058873991604 1.3231058873991604 1.3231058873991604 ;
createNode transform -n "Violin_ctrl01" -p "Violin_ctrl01_offset";
	rename -uid "043A24DF-4DE5-0BB9-E0F1-BAAB60ACE2D1";
createNode nurbsCurve -n "Violin_ctrlShape1" -p "Violin_ctrl01";
	rename -uid "6CBC2AA1-4822-ED67-4EA9-EEB5754D6182";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 17;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		1.7717169924515195 4.7982373409884731e-17 -1.7717169924515204
		1.534229059548726e-16 6.7857323231109122e-17 -2.5055861994118098
		-1.7717169924515195 4.7982373409884719e-17 -1.7717169924515195
		-2.5055861994118094 3.5177356190060272e-33 -4.9477924471831134e-16
		-1.7717169924515195 -4.7982373409884725e-17 1.7717169924515195
		-2.5098628324394794e-16 -6.7857323231109171e-17 2.5055861994118103
		1.7717169924515195 -4.7982373409884719e-17 1.7717169924515195
		2.5055861994118094 -9.2536792101100989e-33 -2.3203308340579491e-17
		1.7717169924515195 4.7982373409884731e-17 -1.7717169924515204
		1.534229059548726e-16 6.7857323231109122e-17 -2.5055861994118098
		-1.7717169924515195 4.7982373409884719e-17 -1.7717169924515195
		;
createNode transform -n "Violin_ctrl02_offset" -p "Violin_ctrl01";
	rename -uid "4675EE04-45D8-997D-6ACB-148BE707A63D";
createNode transform -n "Violin_ctrl02" -p "Violin_ctrl02_offset";
	rename -uid "B6F6FBF3-45C9-D527-21C3-71A990D390B1";
createNode nurbsCurve -n "Violin_ctrlShape2" -p "Violin_ctrl02";
	rename -uid "49A39236-4F45-33AF-AF72-B7B0E8EBFC73";
	setAttr -k off ".v";
	setAttr ".ove" yes;
	setAttr ".ovc" 17;
	setAttr ".cc" -type "nurbsCurve" 
		3 8 2 no 3
		13 -2 -1 0 1 2 3 4 5 6 7 8 9 10
		11
		1.520239249993274 4.7982373409884731e-17 -1.5202392499932746
		1.3164603854585789e-16 6.7857323231109122e-17 -2.1499429653923907
		-1.520239249993274 4.7982373409884719e-17 -1.520239249993274
		-2.1499429653923903 3.5177356190060272e-33 -4.2455021377991703e-16
		-1.520239249993274 -4.7982373409884725e-17 1.520239249993274
		-2.1536125725667761e-16 -6.7857323231109171e-17 2.1499429653923912
		1.520239249993274 -4.7982373409884719e-17 1.520239249993274
		2.1499429653923903 -9.2536792101100989e-33 -1.9909827709128597e-17
		1.520239249993274 4.7982373409884731e-17 -1.5202392499932746
		1.3164603854585789e-16 6.7857323231109122e-17 -2.1499429653923907
		-1.520239249993274 4.7982373409884719e-17 -1.520239249993274
		;
createNode transform -n "Violin_mesh" -p "Violin_all";
	rename -uid "68F6D139-4E52-E653-F51A-1BAB980065F9";
createNode transform -n "Violin_body" -p "Violin_mesh";
	rename -uid "43C0CDDA-4C0A-4E13-0A8E-8195C6FCE3D4";
	setAttr ".rp" -type "double3" -0.0044728606007993221 12.674131155014038 0.81382920402761094 ;
	setAttr ".sp" -type "double3" -0.0044728606007993221 12.674131155014038 0.81382920402761094 ;
createNode mesh -n "Violin_bodyShape" -p "Violin_body";
	rename -uid "184D8292-4666-9B7B-1043-B0AB5C33470D";
	setAttr -k off ".v";
	setAttr ".ovdt" 2;
	setAttr ".ove" yes;
	setAttr ".vir" yes;
	setAttr ".vif" yes;
	setAttr ".pv" -type "double2" 0.58426231145858765 0.4390082061290741 ;
	setAttr ".uvst[0].uvsn" -type "string" "map1";
	setAttr -s 142 ".uvst[0].uvsp[0:141]" -type "float2" 0.8609215 0.59113836
		 0.08448077 0.39825279 0.58426231 0.36594319 0.64217865 0.1376877 0.58426231 0.27649444
		 0.11635955 0.46650234 0.24152562 0.52607834 0.28401026 0.54141217 0.031879555 0.42045408
		 0.67404974 0.20594002 0.62924993 0.28529423 0.28651333 0.44542935 0.34961942 0.27438539
		 0.24152562 0.43662956 0.28059909 0.67220837 0.24152562 0.67013806 0.5335471 0.18842043
		 0.62674689 0.38127705 0.58426231 0.51000297 0.21313137 0.42129946 0 0.43771091 0.62333572
		 0.51207322 0.62270135 0.5363968 0.58426231 0.53679311 0.7162292 0.10311417 0.74810076
		 0.17136705 0.24152562 0.6969282 0.27996466 0.69653195 0.24152562 0.89407372 0.27538353
		 0.87218976 0.87868392 0.89811862 0.13608661 0.053802744 0.32120207 0.12077678 0.30775839
		 0.014693853 0.17880087 0.070098162 0.14936735 0.059669118 0.15619104 0.030500406
		 0.1891077 0.037507396 0.58426231 0.63765115 0.62035787 0.62626207 0.037576579 0.3346507
		 0.27762106 0.78639704 0.24152562 0.79778624 0.57252854 0.084682152 0.24152562 1 0.61812025
		 0.71205461 0.11162525 0.30007154 0.27229026 0.99080276 0.44272929 0.56228632 0.40415558
		 0.16336621 0.58426231 0.73393857 0.83537316 0.57784247 0.66929716 0.039471284 0.76538765
		 0.58021039 0.14350156 0.36832365 0.37193909 0.47115371 0.41380388 0.6745649 0.35039377
		 0.71845311 0.24218985 0.19524659 0.84049886 0.89793074 0.13981418 0.088186011 0.17185496
		 0.10236302 0.24094734 0.072868325 0.29665715 0.05103258 0.29812375 0.11376972 0.23224968
		 0.086393513 0.23106828 0.10301483 0.25400403 0.15793021 0.61502695 0.83066767 0.58426231
		 0.83986491 0.28533989 0.30442002 0.40209725 0.87158763 0.34017071 0.78146797 0.37084946
		 0.96390647 0.19653791 0.44542935 0.50032777 0.20156613 0.74483389 0.71145248 0.71358615
		 0.80377132 0.68290728 0.62133288 0.75654066 0.51442975 0.4175674 0.24262023 0.19904098
		 0.54141217 0.20245215 0.67220837 0.2030865 0.69653195 0.20543019 0.78639704 0.36810443
		 0.26337594 0.69313061 0.55831802 0.71467578 0.31101859 0.3362031 0.19513538 0.22024296
		 0.24933784 0.20766765 0.87218976 0.43605414 0.2316076 0.44946763 0.31086421 0.56542873
		 0.25666764 0.78546596 0.4021512 0.54177773 0.38127705 0.46843487 0.13332377 0.53927451
		 0.28529423 0.21076123 0.99080276 0.60441577 0.15292892 0.31723106 0.37266663 0.38150892
		 0.3426269 0.54518878 0.51207322 0.18125127 0.35305172 0.78565896 0.06825386 0.11111217
		 0.47115371 0.97960979 0.60129952 0.80585074 0.89804697 0.78714561 0.90339255 0.54582328
		 0.5363968 0.75377655 6.2221734e-06 0.13686064 0.12436172 0.25212929 0.31758162 0.040321961
		 0.56228632 0.70118141 0.10771857 0.85959148 0.89802474 0.069453701 0.40290162 0.069247432
		 0.6745649 0.54816681 0.62626207 0.75380462 0.08556366 0.55040419 0.71205461 0.55349791
		 0.83066767 0.45493856 0.80377132 0.42369056 0.71145248 0.91332954 0.89857566 0.031877674
		 0.50596166 0.95654589 0.58115077 0.48561713 0.62133288 0.88658398 0.57809454 0.18244696
		 2.805383e-05 0.13265748 0.71845311 0.14288045 0.78146797 0.080953881 0.87158763 0.11220182
		 0.96390647 0.4753941 0.55831802 0.411984 0.51442975 0.38305864 0.4021512 0.45384884
		 0.31101859 0.78567928 0.15381648 0 0.35220629 0.74215007 0.60013115 0.93198758 0.90410519;
	setAttr ".cuvs" -type "string" "map1";
	setAttr ".dcc" -type "string" "Ambient+Diffuse";
	setAttr ".covm[0]"  0 1 1;
	setAttr ".cdvm[0]"  0 1 1;
	setAttr -s 88 ".vt[0:87]"  -0.0044728606 6.37066412 -0.11523331 -0.0044728606 14.11068058 -0.11523331
		 -0.0044728606 7.59957981 -0.11523331 -0.0044728606 14.11068058 0.81167692 -0.0044728606 7.59957981 0.81167686
		 -0.0044728606 6.37066412 0.81167686 -0.0044728606 12.65538502 0.81167686 2.2129662 8.097033501 -0.11523331
		 1.43279624 6.8449831 -0.11523331 1.42078829 13.61480045 -0.11523331 1.42078829 13.61480045 0.81167692
		 1.43279624 6.8449831 0.81167686 2.2129662 8.097033501 0.81167686 -0.0044728606 12.65538502 -0.11523331
		 -0.0044728606 9.94684792 -0.11523331 -0.0044728606 9.94684792 0.81167686 1.19534862 10.24257374 -0.11523331
		 1.19534862 10.24257374 0.81167686 1.76516652 12.34645271 0.81167686 0.33457837 13.9843235 0.81167698
		 0.36867121 12.35472488 0.81167686 0.41915846 9.94140434 0.81167686 0.46374574 7.81024837 0.81167686
		 0.49133173 6.49156237 0.81167686 0.46374574 7.81024837 -0.11523331 0.41915843 9.94140434 -0.11523331
		 0.36867121 12.35472488 -0.11523331 0.24833862 17.055112839 0.81167698 -0.0044728606 17.055112839 0.81167692
		 -0.0044728606 17.044979095 0.35300979 0.24833862 17.044979095 0.35300979 1.76516652 12.34645271 -0.11523331
		 0.49133173 6.49156237 -0.11523331 0.33457837 13.9843235 -0.11523331 -0.0044728606 18.68924522 -0.099418283
		 -0.0044728606 18.36434746 0.38611823 0.15177089 18.36434746 0.38611829 0.15177089 18.68924522 -0.099418283
		 -2.22191191 8.097033501 -0.11523331 -1.44174194 6.8449831 -0.11523331 -1.42973399 13.61480045 -0.11523331
		 -1.42973399 13.61480045 0.81167692 -1.44174194 6.8449831 0.81167686 -2.22191191 8.097033501 0.81167686
		 -1.20429432 10.24257374 -0.11523331 -1.20429432 10.24257374 0.81167686 -1.77411222 12.34645271 0.81167686
		 -0.3435241 13.9843235 0.81167698 -0.37761694 12.35472488 0.81167686 -0.42810419 9.94140434 0.81167686
		 -0.47269148 7.81024837 0.81167686 -0.50027746 6.49156237 0.81167686 -0.47269148 7.81024837 -0.11523331
		 -0.42810416 9.94140434 -0.11523331 -0.37761694 12.35472488 -0.11523331 -0.3435241 13.9843235 -0.11523331
		 -0.25728434 17.055112839 0.81167698 -0.25728434 17.044979095 0.35300979 -1.77411222 12.34645271 -0.11523331
		 -0.50027746 6.49156237 -0.11523331 -0.16071661 18.36434746 0.38611829 -0.16071661 18.68924522 -0.099418283
		 0.15177089 18.35266685 -0.53769803 0.24833862 17.044979095 0.17676304 -0.004472883 17.044979095 0.17676304
		 -0.004472883 18.35266685 -0.53769815 -0.16071659 18.35266685 -0.53769815 -0.25728431 17.044979095 0.17676304
		 -0.0044728611 11.33251381 0.81167686 0.39332962 11.17604065 0.81167686 1.082680941 11.10832024 0.81167686
		 1.082680941 11.10832024 -0.11523332 0.39332956 11.1760397 -0.11523331 -0.0044728606 11.33251381 -0.11523331
		 -0.40227532 11.1760397 -0.11523331 -1.091626644 11.10832024 -0.11523331 -1.091626644 11.10832024 0.81167686
		 -0.40227532 11.17604065 0.81167686 -0.0044728606 9.57878399 0.81167686 0.42614996 9.60722733 0.81167686
		 1.89418197 9.63960266 0.81167686 1.89418197 9.63960266 -0.1152333 0.42614996 9.60722828 -0.11523331
		 -0.0044728606 9.57878399 -0.11523331 -0.4350957 9.60722828 -0.11523331 -1.90312779 9.63960266 -0.11523331
		 -1.90312779 9.63960266 0.81167686 -0.43509573 9.60722733 0.81167686;
	setAttr -s 172 ".ed";
	setAttr ".ed[0:165]"  0 2 0 5 4 0 7 8 0 9 31 0 7 24 1 11 23 0 10 18 0 12 22 1
		 12 11 0 14 73 0 31 26 1 6 68 0 17 21 1 6 20 1 17 70 0 18 31 0 15 78 0 2 83 0 17 80 0
		 14 25 1 6 3 0 13 1 0 19 10 0 19 20 1 20 18 1 20 69 1 21 15 1 21 79 1 22 4 1 23 5 0
		 22 23 1 23 32 1 32 24 1 24 2 1 24 82 1 25 16 1 26 13 1 25 72 1 33 9 0 26 33 1 28 27 0
		 27 36 0 28 35 0 30 27 0 30 33 0 9 10 0 16 17 1 31 71 0 16 81 0 7 12 1 8 11 0 8 32 0
		 0 5 0 32 0 0 1 29 0 3 28 0 19 27 0 3 19 0 19 33 0 33 1 0 30 29 0 35 36 0 37 30 0
		 36 37 0 37 34 0 39 59 0 38 52 1 3 47 0 42 51 0 41 46 0 43 50 1 43 42 0 44 75 0 14 53 1
		 45 76 0 45 86 0 38 85 0 15 49 1 6 48 1 46 58 0 58 54 1 47 41 0 48 46 1 47 48 1 49 45 1
		 48 77 1 50 4 1 49 87 1 51 5 0 50 51 1 59 0 0 51 59 1 52 2 1 59 52 1 53 44 1 52 84 1
		 53 74 1 54 13 1 54 55 1 28 56 0 56 60 0 57 56 0 55 47 0 57 55 0 40 41 0 55 40 0 40 58 0
		 44 45 1 38 43 1 39 42 0 38 39 0 47 56 0 57 29 0 55 1 0 35 60 0 61 57 0 60 61 0 61 34 0
		 35 34 1 37 62 0 30 63 0 62 63 0 29 64 0 63 64 0 34 65 0 64 65 0 62 65 0 61 66 0 66 65 0
		 57 67 0 67 64 0 66 67 0 68 15 0 69 21 1 68 69 1 70 18 0 69 70 1 71 16 0 70 71 1 72 26 1
		 71 72 1 73 13 0 72 73 1 74 54 1 73 74 1 75 58 0 74 75 1 76 46 0 75 76 1 77 49 1 76 77 1
		 77 68 1 78 4 0 79 22 1 78 79 1 80 12 0 79 80 1 81 7 0 80 81 1 82 25 1 81 82 1 83 14 0
		 82 83 1 84 53 1 83 84 1 85 44 0;
	setAttr ".ed[166:171]" 84 85 1 86 43 0 85 86 1 87 50 1 86 87 1 87 78 1;
	setAttr -s 86 -ch 344 ".fc[0:85]" -type "polyFaces" 
		f 4 -2 -30 -31 28
		mu 0 4 2 4 10 17
		f 4 -34 -33 53 0
		mu 0 4 6 7 11 13
		f 4 -32 29 -53 -54
		mu 0 4 25 24 119 138
		f 4 -51 -3 49 8
		mu 0 4 3 9 93 16
		f 4 154 -28 26 16
		mu 0 4 18 21 22 23
		f 4 162 161 19 -160
		mu 0 4 14 15 26 27
		f 4 46 18 158 -49
		mu 0 4 101 12 80 92
		f 4 -37 -140 142 141
		mu 0 4 28 29 41 42
		f 4 -16 -136 138 -48
		mu 0 4 19 103 70 100
		f 4 134 -26 -14 11
		mu 0 4 38 39 45 50
		f 4 13 -24 -58 -21
		mu 0 4 50 45 68 69
		f 4 6 15 -4 45
		mu 0 4 1 103 19 5
		f 4 21 -60 -40 36
		mu 0 4 28 44 47 29
		f 4 24 -7 -23 23
		mu 0 4 45 76 77 68
		f 4 136 135 -25 25
		mu 0 4 39 78 76 45
		f 4 156 -19 12 27
		mu 0 4 21 79 86 22
		f 4 -6 -9 7 30
		mu 0 4 10 87 94 17
		f 4 50 5 31 -52
		mu 0 4 9 3 24 25
		f 4 -5 2 51 32
		mu 0 4 7 48 55 11
		f 4 160 159 35 48
		mu 0 4 56 14 27 57
		f 4 -11 47 140 139
		mu 0 4 29 71 72 41
		f 4 38 3 10 39
		mu 0 4 47 73 71 29
		f 4 22 -46 -39 -59
		mu 0 4 20 1 5 125
		f 4 -63 -64 -42 -44
		mu 0 4 33 37 36 129
		f 4 41 -62 -43 40
		mu 0 4 129 36 35 31
		f 4 56 -41 -56 57
		mu 0 4 128 30 115 0
		f 4 -45 43 -57 58
		mu 0 4 126 124 30 128
		f 4 59 54 -61 44
		mu 0 4 126 106 141 124
		f 4 121 123 125 -127
		mu 0 4 62 63 64 65
		f 4 -87 89 88 1
		mu 0 4 2 95 97 4
		f 4 -1 -91 93 92
		mu 0 4 6 13 74 81
		f 4 90 52 -89 91
		mu 0 4 116 8 139 40
		f 4 -72 -109 110 109
		mu 0 4 46 89 112 54
		f 4 171 -17 77 87
		mu 0 4 102 18 23 109
		f 4 163 -74 -162 164
		mu 0 4 82 83 26 15
		f 4 -166 168 -76 -108
		mu 0 4 91 85 88 49
		f 4 -142 144 143 97
		mu 0 4 28 42 84 90
		f 4 -146 148 147 79
		mu 0 4 99 75 96 43
		f 4 151 -12 78 85
		mu 0 4 118 38 50 120
		f 4 20 67 83 -79
		mu 0 4 50 69 121 120
		f 4 -105 106 -80 -70
		mu 0 4 52 114 99 43
		f 4 -98 98 113 -22
		mu 0 4 28 90 98 44
		f 4 -84 81 69 -83
		mu 0 4 120 121 122 123
		f 4 -86 82 -148 150
		mu 0 4 118 120 123 127
		f 4 -88 84 75 170
		mu 0 4 102 109 134 135
		f 4 -90 -71 71 68
		mu 0 4 97 95 136 137
		f 4 65 -92 -69 -110
		mu 0 4 54 116 40 46
		f 4 -94 -66 -111 66
		mu 0 4 81 74 105 113
		f 4 165 -95 -164 166
		mu 0 4 117 130 83 82
		f 4 -144 146 145 80
		mu 0 4 90 84 131 132
		f 4 -99 -81 -107 -106
		mu 0 4 98 90 132 133
		f 4 -103 105 104 -82
		mu 0 4 110 104 114 52
		f 4 101 100 116 115
		mu 0 4 58 111 60 61
		f 4 -100 42 114 -101
		mu 0 4 111 31 35 60
		f 4 -68 55 99 -112
		mu 0 4 51 0 115 59
		f 4 102 111 -102 103
		mu 0 4 53 51 59 107
		f 4 -104 112 -55 -114
		mu 0 4 53 107 108 140
		f 4 128 -126 -131 -132
		mu 0 4 66 65 64 67
		f 4 118 -118 -117 -115
		mu 0 4 35 34 61 60
		f 4 63 64 -119 61
		mu 0 4 36 37 34 35
		f 4 62 120 -122 -120
		mu 0 4 37 33 63 62
		f 4 60 122 -124 -121
		mu 0 4 33 32 64 63
		f 4 -65 119 126 -125
		mu 0 4 34 37 62 65
		f 4 117 124 -129 -128
		mu 0 4 61 34 65 66
		f 4 -113 129 130 -123
		mu 0 4 32 58 67 64
		f 4 -116 127 131 -130
		mu 0 4 58 61 66 67
		f 4 -27 -134 -135 132
		mu 0 4 23 22 39 38
		f 4 -13 14 -137 133
		mu 0 4 22 86 78 39
		f 4 -139 -15 -47 -138
		mu 0 4 100 70 12 101
		f 4 -141 137 -36 37
		mu 0 4 41 72 57 27
		f 4 -143 -38 -20 9
		mu 0 4 42 41 27 26
		f 4 -145 -10 73 96
		mu 0 4 84 42 26 83
		f 4 -147 -97 94 72
		mu 0 4 131 84 83 130
		f 4 -149 -73 107 74
		mu 0 4 96 75 91 49
		f 4 -150 -151 -75 -85
		mu 0 4 109 118 127 134
		f 4 -133 -152 149 -78
		mu 0 4 23 38 118 109
		f 4 -29 -154 -155 152
		mu 0 4 2 17 21 18
		f 4 -8 -156 -157 153
		mu 0 4 17 94 79 21
		f 4 -159 155 -50 -158
		mu 0 4 92 80 16 93
		f 4 4 34 -161 157
		mu 0 4 48 7 14 56
		f 4 33 17 -163 -35
		mu 0 4 7 6 15 14
		f 4 95 -165 -18 -93
		mu 0 4 81 82 15 6
		f 4 76 -167 -96 -67
		mu 0 4 113 117 82 81
		f 4 -169 -77 108 -168
		mu 0 4 88 85 112 89
		f 4 -170 -171 167 70
		mu 0 4 95 102 135 136
		f 4 -153 -172 169 86
		mu 0 4 2 18 102 95;
	setAttr ".cd" -type "dataPolyComponent" Index_Data Edge 0 ;
	setAttr ".cvd" -type "dataPolyComponent" Index_Data Vertex 0 ;
	setAttr ".pd[0]" -type "dataPolyComponent" Index_Data UV 46 
		0 0 
		2 0 
		4 0 
		5 0 
		6 0 
		7 0 
		8 0 
		9 0 
		10 0 
		11 0 
		14 0 
		17 0 
		19 0 
		25 0 
		29 0 
		30 0 
		31 0 
		32 0 
		34 0 
		35 0 
		41 0 
		44 0 
		45 0 
		51 0 
		53 0 
		54 0 
		55 0 
		56 0 
		57 0 
		59 0 
		64 0 
		65 0 
		68 0 
		73 0 
		76 0 
		78 0 
		83 0 
		86 0 
		90 0 
		97 0 
		98 0 
		107 0 
		120 0 
		124 0 
		126 0 
		128 0 ;
	setAttr ".hfd" -type "dataPolyComponent" Index_Data Face 0 ;
	setAttr ".ai_translator" -type "string" "polymesh";
createNode transform -n "Violin_bits01" -p "Violin_mesh";
	rename -uid "F7877EDD-4D44-545E-B278-059A8961CE5A";
	setAttr ".t" -type "double3" 0 8.3927545972955695 0.92625826104197539 ;
createNode mesh -n "Violin_bitsShape1" -p "Violin_bits01";
	rename -uid "9F6BFFA3-4430-7869-CA4A-CB8F9580C5BE";
	setAttr -k off ".v";
	setAttr ".ovdt" 2;
	setAttr ".ove" yes;
	setAttr ".vir" yes;
	setAttr ".vif" yes;
	setAttr -s 6 ".gtag";
	setAttr ".gtag[0].gtagnm" -type "string" "back";
	setAttr ".gtag[0].gtagcmp" -type "componentList" 1 "f[2]";
	setAttr ".gtag[1].gtagnm" -type "string" "bottom";
	setAttr ".gtag[1].gtagcmp" -type "componentList" 1 "f[3]";
	setAttr ".gtag[2].gtagnm" -type "string" "front";
	setAttr ".gtag[2].gtagcmp" -type "componentList" 1 "f[0]";
	setAttr ".gtag[3].gtagnm" -type "string" "left";
	setAttr ".gtag[3].gtagcmp" -type "componentList" 1 "f[5]";
	setAttr ".gtag[4].gtagnm" -type "string" "right";
	setAttr ".gtag[4].gtagcmp" -type "componentList" 1 "f[4]";
	setAttr ".gtag[5].gtagnm" -type "string" "top";
	setAttr ".gtag[5].gtagcmp" -type "componentList" 1 "f[1]";
	setAttr ".pv" -type "double2" 0.5704487556737281 0.42079988519077771 ;
	setAttr ".uvst[0].uvsn" -type "string" "map1";
	setAttr -s 8 ".uvst[0].uvsp[0:7]" -type "float2" 0.53198725 0.40431637
		 0.60891026 0.40431637 0.60891026 0.4372834 0.53198725 0.4372834 0.60891026 0.4372834
		 0.53198725 0.4372834 0.53198725 0.40431637 0.60891026 0.40431637;
	setAttr ".cuvs" -type "string" "map1";
	setAttr ".dcc" -type "string" "Ambient+Diffuse";
	setAttr ".covm[0]"  0 1 1;
	setAttr ".cdvm[0]"  0 1 1;
	setAttr -s 8 ".pt[0:7]" -type "float3"  0 0.35113636 -0.24887125 
		0 0.35113636 -0.24887125 0 -0.35113636 -0.24887125 0 -0.35113636 -0.24887125 0 -0.35113636 
		0.24887125 0 -0.35113636 0.24887125 0 0.35113636 0.24887125 0 0.35113636 0.24887125;
	setAttr -s 8 ".vt[0:7]"  -0.5 -0.49999809 0.5 0.5 -0.49999809 0.5
		 -0.5 0.49999809 0.5 0.5 0.49999809 0.5 -0.5 0.49999809 -0.5 0.5 0.49999809 -0.5 -0.5 -0.49999809 -0.5
		 0.5 -0.49999809 -0.5;
	setAttr -s 12 ".ed[0:11]"  0 1 0 2 3 0 4 5 0 6 7 0 0 2 0 1 3 0 2 4 0
		 3 5 0 4 6 0 5 7 0 6 0 0 7 1 0;
	setAttr -s 5 -ch 20 ".fc[0:4]" -type "polyFaces" 
		f 4 0 5 -2 -5
		mu 0 4 0 1 2 3
		f 4 1 7 -3 -7
		mu 0 4 3 2 4 5
		f 4 3 11 -1 -11
		mu 0 4 6 7 1 0
		f 4 -12 -10 -8 -6
		mu 0 4 1 7 4 2
		f 4 10 4 6 8
		mu 0 4 6 0 3 5;
	setAttr ".cd" -type "dataPolyComponent" Index_Data Edge 0 ;
	setAttr ".cvd" -type "dataPolyComponent" Index_Data Vertex 0 ;
	setAttr ".pd[0]" -type "dataPolyComponent" Index_Data UV 0 ;
	setAttr ".hfd" -type "dataPolyComponent" Index_Data Face 0 ;
	setAttr ".ai_translator" -type "string" "polymesh";
createNode transform -n "Violin_bits02" -p "Violin_mesh";
	rename -uid "189CE20A-473F-1953-1CDD-65B44C9DC013";
	setAttr ".t" -type "double3" 0 9.7716311745242894 0.92625826104197539 ;
createNode mesh -n "Violin_bitsShape2" -p "Violin_bits02";
	rename -uid "ED4AC3D9-4054-F560-C307-66BA83177D47";
	setAttr -k off ".v";
	setAttr ".ovdt" 2;
	setAttr ".ove" yes;
	setAttr ".vir" yes;
	setAttr ".vif" yes;
	setAttr ".pv" -type "double2" 0.15715579785421219 0.92028762256869912 ;
	setAttr ".uvst[0].uvsn" -type "string" "map1";
	setAttr -s 8 ".uvst[0].uvsp[0:7]" -type "float2" 0.11869429 0.90380412
		 0.1956173 0.90380412 0.1956173 0.93677115 0.11869429 0.93677115 0.1956173 0.93677115
		 0.11869429 0.93677115 0.11869429 0.90380412 0.1956173 0.90380412;
	setAttr ".cuvs" -type "string" "map1";
	setAttr ".dcc" -type "string" "Ambient+Diffuse";
	setAttr ".covm[0]"  0 1 1;
	setAttr ".cdvm[0]"  0 1 1;
	setAttr -s 8 ".pt[0:7]" -type "float3"  0 0.43049115 -0.24887125 
		0 0.43049115 -0.24887125 0 -0.43049115 -0.24887125 0 -0.43049115 -0.24887125 0 -0.43049115 
		0.24887125 0 -0.43049115 0.24887125 0 0.43049115 0.24887125 0 0.43049115 0.24887125;
	setAttr -s 8 ".vt[0:7]"  -0.5 -0.49999809 0.5 0.5 -0.49999809 0.5
		 -0.5 0.49999809 0.5 0.5 0.49999809 0.5 -0.5 0.49999809 -0.5 0.5 0.49999809 -0.5 -0.5 -0.49999809 -0.5
		 0.5 -0.49999809 -0.5;
	setAttr -s 12 ".ed[0:11]"  0 1 0 2 3 0 4 5 0 6 7 0 0 2 0 1 3 0 2 4 0
		 3 5 0 4 6 0 5 7 0 6 0 0 7 1 0;
	setAttr -s 5 -ch 20 ".fc[0:4]" -type "polyFaces" 
		f 4 0 5 -2 -5
		mu 0 4 0 1 2 3
		f 4 1 7 -3 -7
		mu 0 4 3 2 4 5
		f 4 3 11 -1 -11
		mu 0 4 6 7 1 0
		f 4 -12 -10 -8 -6
		mu 0 4 1 7 4 2
		f 4 10 4 6 8
		mu 0 4 6 0 3 5;
	setAttr ".cd" -type "dataPolyComponent" Index_Data Edge 0 ;
	setAttr ".cvd" -type "dataPolyComponent" Index_Data Vertex 0 ;
	setAttr ".pd[0]" -type "dataPolyComponent" Index_Data UV 0 ;
	setAttr ".hfd" -type "dataPolyComponent" Index_Data Face 0 ;
	setAttr ".ai_translator" -type "string" "polymesh";
createNode transform -n "Violin_bits03" -p "Violin_mesh";
	rename -uid "3E0C76DD-4EF8-8068-C33C-C68DBEFC6B99";
	setAttr ".t" -type "double3" 0 10.686693435553003 0.92625826104197539 ;
createNode mesh -n "Violin_bitsShape3" -p "Violin_bits03";
	rename -uid "E090982C-4867-D642-91FE-D9A2F2A57725";
	setAttr -k off ".v";
	setAttr ".ovdt" 2;
	setAttr ".ove" yes;
	setAttr ".vir" yes;
	setAttr ".vif" yes;
	setAttr ".pv" -type "double2" 0.57707911729812622 0.83068516134069514 ;
	setAttr ".uvst[0].uvsn" -type "string" "map1";
	setAttr -s 6 ".uvst[0].uvsp[0:5]" -type "float2" 0.53861761 0.57449579
		 0.61554062 0.57449579 0.61554062 0.83068514 0.53861761 0.83068514 0.53861761 0.57449579
		 0.61554062 0.57449579;
	setAttr ".cuvs" -type "string" "map1";
	setAttr ".dcc" -type "string" "Ambient+Diffuse";
	setAttr ".covm[0]"  0 1 1;
	setAttr ".cdvm[0]"  0 1 1;
	setAttr -s 6 ".pt[0:5]" -type "float3"  0 0.35113636 -0.24887125 
		0 0.35113636 -0.24887125 0 -15.061017 0.11542244 0 -15.061017 0.11542244 0 0.35113636 
		0.24887125 0 0.35113636 0.24887125;
	setAttr -s 6 ".vt[0:5]"  -0.5 -0.49999809 0.5 0.5 -0.49999809 0.5
		 -0.25676227 21.44602585 -0.23189187 0.25676227 21.44602585 -0.23189187 -0.5 -0.49999809 -0.5
		 0.5 -0.49999809 -0.5;
	setAttr -s 9 ".ed[0:8]"  0 1 0 2 3 0 4 5 0 0 2 0 1 3 0 2 4 0 3 5 0
		 4 0 0 5 1 0;
	setAttr -s 4 -ch 14 ".fc[0:3]" -type "polyFaces" 
		f 4 4 -2 -4 0
		mu 0 4 1 2 3 0
		f 4 2 8 -1 -8
		mu 0 4 4 5 1 0
		f 3 -9 -7 -5
		mu 0 3 1 5 2
		f 3 7 3 5
		mu 0 3 4 0 3;
	setAttr ".cd" -type "dataPolyComponent" Index_Data Edge 0 ;
	setAttr ".cvd" -type "dataPolyComponent" Index_Data Vertex 0 ;
	setAttr ".pd[0]" -type "dataPolyComponent" Index_Data UV 0 ;
	setAttr ".hfd" -type "dataPolyComponent" Index_Data Face 0 ;
	setAttr ".ai_translator" -type "string" "polymesh";
createNode transform -n "Violin_strings" -p "Violin_mesh";
	rename -uid "2EE30204-451C-54F2-F1E7-62B6D250FDB2";
	setAttr ".rp" -type "double3" -0.016041293740272522 13.319244861602783 0.72787708044052124 ;
	setAttr ".sp" -type "double3" -0.016041293740272522 13.319244861602783 0.72787708044052124 ;
createNode mesh -n "Violin_stringsShape" -p "Violin_strings";
	rename -uid "A29C4C98-4ADC-0B7A-81CC-D490EF7D6CD0";
	setAttr -k off ".v";
	setAttr ".iog[0].og[0].gcl" -type "componentList" 1 "f[0:11]";
	setAttr ".ovdt" 2;
	setAttr ".ove" yes;
	setAttr ".vir" yes;
	setAttr ".vif" yes;
	setAttr ".uvst[0].uvsn" -type "string" "map1";
	setAttr -s 40 ".uvst[0].uvsp[0:39]" -type "float2" 0 0.15584157 1 0.15584157
		 1 1 0 1 0 0 1 0 0 0 1 0 1 1 0 1 0 0.15584157 1 0.15584157 1 1 0 1 0 0 1 0 0 0 1 0
		 1 1 0 1 0 0.15584157 1 0.15584157 1 1 0 1 0 0 1 0 0 0 1 0 1 1 0 1 0 0.15584157 1
		 0.15584157 1 1 0 1 0 0 1 0 0 0 1 0 1 1 0 1;
	setAttr ".cuvs" -type "string" "map1";
	setAttr ".dcc" -type "string" "Ambient+Diffuse";
	setAttr ".covm[0]"  0 1 1;
	setAttr ".cdvm[0]"  0 1 1;
	setAttr -s 32 ".vt[0:31]"  0.2887775 8.34003735 1.036944747 0.33908436 8.34003735 1.036944747
		 0.17277053 17.041007996 0.91320968 0.2009431 17.041007996 0.91320968 0.27094644 9.67743492 1.22974885
		 0.31785107 9.67743492 1.22974885 0.13204603 18.29845238 0.35636854 0.15304294 18.29845238 0.35636854
		 0.032679733 8.34003735 1.036944747 0.082986601 8.34003735 1.036944747 0.029351979 17.041007996 0.91320968
		 0.057524577 17.041007996 0.91320968 0.032168243 9.67743492 1.22974885 0.079072937 9.67743492 1.22974885
		 0.025156697 18.29845238 0.26892847 0.046153639 18.29845238 0.26892847 -0.16923453 8.34003735 1.036944747
		 -0.11892765 8.34003735 1.036944747 -0.083722979 17.041007996 0.91320968 -0.055550382 17.041007996 0.91320968
		 -0.15609081 9.67743492 1.22974885 -0.10918617 9.67743492 1.22974885 -0.059117652 18.29845238 0.22600532
		 -0.038120721 18.29845238 0.22600532 -0.37116694 8.34003735 1.036944747 -0.32086006 8.34003735 1.036944747
		 -0.19680822 17.041007996 0.91320968 -0.16863564 17.041007996 0.91320968 -0.34436676 9.67743492 1.22974885
		 -0.29746214 9.67743492 1.22974885 -0.1433997 18.29845238 0.30588138 -0.12240276 18.29845238 0.30588138;
	setAttr -s 40 ".ed[0:39]"  0 1 0 0 4 0 1 5 0 2 3 0 4 2 0 5 3 0 4 5 1
		 2 6 0 3 7 0 6 7 0 8 9 0 8 12 0 9 13 0 10 11 0 12 10 0 13 11 0 12 13 1 10 14 0 11 15 0
		 14 15 0 16 17 0 16 20 0 17 21 0 18 19 0 20 18 0 21 19 0 20 21 1 18 22 0 19 23 0 22 23 0
		 24 25 0 24 28 0 25 29 0 26 27 0 28 26 0 29 27 0 28 29 1 26 30 0 27 31 0 30 31 0;
	setAttr -s 12 -ch 48 ".fc[0:11]" -type "polyFaces" 
		f 4 6 5 -4 -5
		mu 0 4 0 1 2 3
		f 4 0 2 -7 -2
		mu 0 4 4 5 1 0
		f 4 3 8 -10 -8
		mu 0 4 6 7 8 9
		f 4 16 15 -14 -15
		mu 0 4 10 11 12 13
		f 4 10 12 -17 -12
		mu 0 4 14 15 11 10
		f 4 13 18 -20 -18
		mu 0 4 16 17 18 19
		f 4 26 25 -24 -25
		mu 0 4 20 21 22 23
		f 4 20 22 -27 -22
		mu 0 4 24 25 21 20
		f 4 23 28 -30 -28
		mu 0 4 26 27 28 29
		f 4 36 35 -34 -35
		mu 0 4 30 31 32 33
		f 4 30 32 -37 -32
		mu 0 4 34 35 31 30
		f 4 33 38 -40 -38
		mu 0 4 36 37 38 39;
	setAttr ".cd" -type "dataPolyComponent" Index_Data Edge 0 ;
	setAttr ".cvd" -type "dataPolyComponent" Index_Data Vertex 0 ;
	setAttr ".pd[0]" -type "dataPolyComponent" Index_Data UV 0 ;
	setAttr ".hfd" -type "dataPolyComponent" Index_Data Face 0 ;
	setAttr ".ai_translator" -type "string" "polymesh";
createNode transform -n "Violin_twisties" -p "Violin_mesh";
	rename -uid "033CCA23-4C30-87E0-19CF-F28547446C32";
	setAttr ".rp" -type "double3" 0.056241537124335328 17.775204565746918 0.18167909194791457 ;
	setAttr ".sp" -type "double3" 0.056241537124335328 17.775204565746918 0.18167909194791457 ;
createNode mesh -n "Violin_twistiesShape" -p "Violin_twisties";
	rename -uid "289302EA-4F12-0574-A3FD-DCA687D2E31A";
	setAttr -k off ".v";
	setAttr ".ovdt" 2;
	setAttr ".ove" yes;
	setAttr ".vir" yes;
	setAttr ".vif" yes;
	setAttr ".uvst[0].uvsn" -type "string" "map1";
	setAttr -s 32 ".uvst[0].uvsp[0:31]" -type "float2" 0.53198725 0.40431637
		 0.60891026 0.40431637 0.60891026 0.4372834 0.53198725 0.4372834 0.60891026 0.4372834
		 0.53198725 0.4372834 0.53198725 0.40431637 0.60891026 0.40431637 0.53198725 0.40431637
		 0.60891026 0.40431637 0.60891026 0.4372834 0.53198725 0.4372834 0.60891026 0.4372834
		 0.53198725 0.4372834 0.53198725 0.40431637 0.60891026 0.40431637 0.53198725 0.40431637
		 0.53198725 0.4372834 0.60891026 0.4372834 0.60891026 0.40431637 0.53198725 0.4372834
		 0.60891026 0.4372834 0.53198725 0.40431637 0.60891026 0.40431637 0.53198725 0.40431637
		 0.53198725 0.4372834 0.60891026 0.4372834 0.60891026 0.40431637 0.53198725 0.4372834
		 0.60891026 0.4372834 0.53198725 0.40431637 0.60891026 0.40431637;
	setAttr ".cuvs" -type "string" "map1";
	setAttr ".dcc" -type "string" "Ambient+Diffuse";
	setAttr ".covm[0]"  0 1 1;
	setAttr ".cdvm[0]"  0 1 1;
	setAttr -s 32 ".vt[0:31]"  0.12543976 17.53544426 0.44029593 1.12543976 17.53544426 0.44029593
		 0.12543976 17.79809189 0.30009991 1.12543976 17.79809189 0.30009991 0.12543976 17.63638878 -0.0028431416
		 1.12543976 17.63638878 -0.0028431416 0.12543976 17.37373924 0.13735288 1.12543976 17.37373924 0.13735288
		 0.12543976 18.22360229 0.22235723 1.12543976 18.22360229 0.22235723 0.12543976 18.48625183 0.08216121
		 1.12543976 18.48625183 0.08216121 0.12543976 18.32454681 -0.22078185 1.12543976 18.32454681 -0.22078185
		 0.12543976 18.061899185 -0.08058583 1.12543976 18.061899185 -0.08058583 -0.012956679 17.91402054 0.36620134
		 -1.012956619 17.91402054 0.36620134 -0.012956679 18.17667007 0.22600532 -1.012956619 18.17667007 0.22600532
		 -0.012956679 18.014965057 -0.07693775 -1.012956619 18.014965057 -0.07693775 -0.012956679 17.75231743 0.063258268
		 -1.012956619 17.75231743 0.063258268 -0.012956679 17.2258625 0.58414006 -1.012956619 17.2258625 0.58414006
		 -0.012956679 17.48851013 0.44394401 -1.012956619 17.48851013 0.44394401 -0.012956679 17.32680702 0.14100096
		 -1.012956619 17.32680702 0.14100096 -0.012956679 17.064157486 0.28119698 -1.012956619 17.064157486 0.28119698;
	setAttr -s 48 ".ed[0:47]"  0 1 0 2 3 0 4 5 0 6 7 0 0 2 0 1 3 0 2 4 0
		 3 5 0 4 6 0 5 7 0 6 0 0 7 1 0 8 9 0 10 11 0 12 13 0 14 15 0 8 10 0 9 11 0 10 12 0
		 11 13 0 12 14 0 13 15 0 14 8 0 15 9 0 16 17 0 18 19 0 20 21 0 22 23 0 16 18 0 17 19 0
		 18 20 0 19 21 0 20 22 0 21 23 0 22 16 0 23 17 0 24 25 0 26 27 0 28 29 0 30 31 0 24 26 0
		 25 27 0 26 28 0 27 29 0 28 30 0 29 31 0 30 24 0 31 25 0;
	setAttr -s 24 -ch 96 ".fc[0:23]" -type "polyFaces" 
		f 4 0 5 -2 -5
		mu 0 4 0 1 2 3
		f 4 1 7 -3 -7
		mu 0 4 3 2 4 5
		f 4 3 11 -1 -11
		mu 0 4 6 7 1 0
		f 4 -12 -10 -8 -6
		mu 0 4 1 7 4 2
		f 4 10 4 6 8
		mu 0 4 6 0 3 5
		f 4 9 -4 -9 2
		mu 0 4 4 7 6 5
		f 4 12 17 -14 -17
		mu 0 4 8 9 10 11
		f 4 13 19 -15 -19
		mu 0 4 11 10 12 13
		f 4 15 23 -13 -23
		mu 0 4 14 15 9 8
		f 4 -24 -22 -20 -18
		mu 0 4 9 15 12 10
		f 4 22 16 18 20
		mu 0 4 14 8 11 13
		f 4 21 -16 -21 14
		mu 0 4 12 15 14 13
		f 4 28 25 -30 -25
		mu 0 4 16 17 18 19
		f 4 30 26 -32 -26
		mu 0 4 17 20 21 18
		f 4 34 24 -36 -28
		mu 0 4 22 16 19 23
		f 4 29 31 33 35
		mu 0 4 19 18 21 23
		f 4 -33 -31 -29 -35
		mu 0 4 22 20 17 16
		f 4 -27 32 27 -34
		mu 0 4 21 20 22 23
		f 4 40 37 -42 -37
		mu 0 4 24 25 26 27
		f 4 42 38 -44 -38
		mu 0 4 25 28 29 26
		f 4 46 36 -48 -40
		mu 0 4 30 24 27 31
		f 4 41 43 45 47
		mu 0 4 27 26 29 31
		f 4 -45 -43 -41 -47
		mu 0 4 30 28 25 24
		f 4 -39 44 39 -46
		mu 0 4 29 28 30 31;
	setAttr ".cd" -type "dataPolyComponent" Index_Data Edge 0 ;
	setAttr ".cvd" -type "dataPolyComponent" Index_Data Vertex 0 ;
	setAttr ".pd[0]" -type "dataPolyComponent" Index_Data UV 0 ;
	setAttr ".hfd" -type "dataPolyComponent" Index_Data Face 0 ;
	setAttr ".ai_translator" -type "string" "polymesh";
createNode parentConstraint -n "Violin_mesh_parentConstraint1" -p "Violin_mesh";
	rename -uid "9A63BE74-490C-66CD-23B3-0AAEAFC3CCB2";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "Violin_ctrl02W0" -dv 1 -min 0 -at "double";
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
	setAttr ".tg[0].tot" -type "double3" 0 -10.494950143322708 -0.39649655372831583 ;
	setAttr -k on ".w0";
createNode scaleConstraint -n "Violin_mesh_scaleConstraint1" -p "Violin_mesh";
	rename -uid "D4C00481-4D7E-E783-DA26-708FF0C75EB5";
	addAttr -dcb 0 -ci true -k true -sn "w0" -ln "Violin_ctrl02W0" -dv 1 -min 0 -at "double";
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
	rename -uid "D1564D78-4B77-8A03-4402-96B834697F10";
	setAttr -s 5 ".lnk";
	setAttr -s 5 ".slnk";
createNode shapeEditorManager -n "shapeEditorManager";
	rename -uid "201E2D45-4081-A90C-1F97-02A8283F6719";
createNode poseInterpolatorManager -n "poseInterpolatorManager";
	rename -uid "EA6CAF4A-4921-0161-967A-809CA565840D";
createNode displayLayerManager -n "layerManager";
	rename -uid "6E6C273A-4F94-D6F8-2CCF-C7B007829BD5";
createNode displayLayer -n "defaultLayer";
	rename -uid "127AE66E-4E7A-4F00-AD83-0D89918734B8";
createNode renderLayerManager -n "renderLayerManager";
	rename -uid "F163BB3F-4A0E-E2AD-1A69-199C81D07090";
createNode renderLayer -n "defaultRenderLayer";
	rename -uid "5B1D08D2-4F57-B150-D545-78BE285DF63C";
	setAttr ".g" yes;
createNode script -n "uiConfigurationScriptNode";
	rename -uid "71988FCB-4E9F-6DEA-B8D9-568FCF5B432D";
	setAttr ".b" -type "string" (
		"// Maya Mel UI Configuration File.\n//\n//  This script is machine generated.  Edit at your own risk.\n//\n//\n\nglobal string $gMainPane;\nif (`paneLayout -exists $gMainPane`) {\n\n\tglobal int $gUseScenePanelConfig;\n\tint    $useSceneConfig = $gUseScenePanelConfig;\n\tint    $nodeEditorPanelVisible = stringArrayContains(\"nodeEditorPanel1\", `getPanel -vis`);\n\tint    $nodeEditorWorkspaceControlOpen = (`workspaceControl -exists nodeEditorPanel1Window` && `workspaceControl -q -visible nodeEditorPanel1Window`);\n\tint    $menusOkayInPanels = `optionVar -q allowMenusInPanels`;\n\tint    $nVisPanes = `paneLayout -q -nvp $gMainPane`;\n\tint    $nPanes = 0;\n\tstring $editorName;\n\tstring $panelName;\n\tstring $itemFilterName;\n\tstring $panelConfig;\n\n\t//\n\t//  get current state of the UI\n\t//\n\tsceneUIReplacement -update $gMainPane;\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Top View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Top View\")) -mbv $menusOkayInPanels  $panelName;\n"
		+ "\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|persp\" \n            -useInteractiveMode 0\n            -displayLights \"flat\" \n            -displayAppearance \"smoothShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n            -wireframeOnShaded 0\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 0\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n            -xray 0\n            -jointXray 0\n            -activeComponentsXray 0\n            -displayTextures 1\n            -smoothWireframe 0\n            -lineWidth 1\n            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n"
		+ "            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -rendererName \"vp2Renderer\" \n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 256 256 \n            -bumpResolution 512 512 \n            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 1\n            -occlusionCulling 0\n            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n            -interactiveBackFaceCull 0\n            -sortTransparent 1\n            -controllers 1\n            -nurbsCurves 1\n            -nurbsSurfaces 1\n            -polymeshes 1\n            -subdivSurfaces 1\n            -planes 1\n            -lights 1\n            -cameras 1\n            -controlVertices 1\n"
		+ "            -hulls 1\n            -grid 1\n            -imagePlane 1\n            -joints 1\n            -ikHandles 1\n            -deformers 1\n            -dynamics 1\n            -particleInstancers 1\n            -fluids 1\n            -hairSystems 1\n            -follicles 1\n            -nCloths 1\n            -nParticles 1\n            -nRigids 1\n            -dynamicConstraints 1\n            -locators 1\n            -manipulators 1\n            -pluginShapes 1\n            -dimensions 1\n            -handles 1\n            -pivots 1\n            -textures 1\n            -strokes 1\n            -motionTrails 1\n            -clipGhosts 1\n            -greasePencils 1\n            -shadows 0\n            -captureSequenceNumber -1\n            -width 1174\n            -height 1040\n            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 1 \n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n"
		+ "\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Side View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Side View\")) -mbv $menusOkayInPanels  $panelName;\n\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|side\" \n            -useInteractiveMode 0\n            -displayLights \"default\" \n            -displayAppearance \"smoothShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n            -wireframeOnShaded 0\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 0\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n            -xray 0\n            -jointXray 0\n            -activeComponentsXray 0\n            -displayTextures 0\n            -smoothWireframe 0\n            -lineWidth 1\n            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n"
		+ "            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -rendererName \"vp2Renderer\" \n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 256 256 \n            -bumpResolution 512 512 \n            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 1\n            -occlusionCulling 0\n            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n            -interactiveBackFaceCull 0\n"
		+ "            -sortTransparent 1\n            -controllers 1\n            -nurbsCurves 1\n            -nurbsSurfaces 1\n            -polymeshes 1\n            -subdivSurfaces 1\n            -planes 1\n            -lights 1\n            -cameras 1\n            -controlVertices 1\n            -hulls 1\n            -grid 1\n            -imagePlane 1\n            -joints 1\n            -ikHandles 1\n            -deformers 1\n            -dynamics 1\n            -particleInstancers 1\n            -fluids 1\n            -hairSystems 1\n            -follicles 1\n            -nCloths 1\n            -nParticles 1\n            -nRigids 1\n            -dynamicConstraints 1\n            -locators 1\n            -manipulators 1\n            -pluginShapes 1\n            -dimensions 1\n            -handles 1\n            -pivots 1\n            -textures 1\n            -strokes 1\n            -motionTrails 1\n            -clipGhosts 1\n            -greasePencils 1\n            -shadows 0\n            -captureSequenceNumber -1\n            -width 1\n            -height 1\n"
		+ "            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 1 \n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Front View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Front View\")) -mbv $menusOkayInPanels  $panelName;\n\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|front\" \n            -useInteractiveMode 0\n            -displayLights \"default\" \n            -displayAppearance \"smoothShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n            -wireframeOnShaded 1\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 1\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n"
		+ "            -xray 0\n            -jointXray 0\n            -activeComponentsXray 0\n            -displayTextures 1\n            -smoothWireframe 0\n            -lineWidth 1\n            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -rendererName \"vp2Renderer\" \n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 256 256 \n            -bumpResolution 512 512 \n            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 1\n            -occlusionCulling 0\n"
		+ "            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n            -interactiveBackFaceCull 0\n            -sortTransparent 1\n            -controllers 1\n            -nurbsCurves 1\n            -nurbsSurfaces 1\n            -polymeshes 1\n            -subdivSurfaces 1\n            -planes 1\n            -lights 1\n            -cameras 1\n            -controlVertices 1\n            -hulls 1\n            -grid 1\n            -imagePlane 1\n            -joints 1\n            -ikHandles 1\n            -deformers 1\n            -dynamics 1\n            -particleInstancers 1\n            -fluids 1\n            -hairSystems 1\n            -follicles 1\n            -nCloths 1\n            -nParticles 1\n            -nRigids 1\n            -dynamicConstraints 1\n            -locators 1\n            -manipulators 1\n            -pluginShapes 1\n            -dimensions 1\n            -handles 1\n            -pivots 1\n"
		+ "            -textures 1\n            -strokes 1\n            -motionTrails 1\n            -clipGhosts 1\n            -greasePencils 1\n            -shadows 0\n            -captureSequenceNumber -1\n            -width 1\n            -height 1\n            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 1 \n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"modelPanel\" (localizedPanelLabel(\"Persp View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tmodelPanel -edit -l (localizedPanelLabel(\"Persp View\")) -mbv $menusOkayInPanels  $panelName;\n\t\t$editorName = $panelName;\n        modelEditor -e \n            -camera \"|persp\" \n            -useInteractiveMode 0\n            -displayLights \"flat\" \n            -displayAppearance \"smoothShaded\" \n            -activeOnly 0\n            -ignorePanZoom 0\n"
		+ "            -wireframeOnShaded 0\n            -headsUpDisplay 1\n            -holdOuts 1\n            -selectionHiliteDisplay 1\n            -useDefaultMaterial 0\n            -bufferMode \"double\" \n            -twoSidedLighting 0\n            -backfaceCulling 0\n            -xray 0\n            -jointXray 0\n            -activeComponentsXray 0\n            -displayTextures 1\n            -smoothWireframe 0\n            -lineWidth 1\n            -textureAnisotropic 0\n            -textureHilight 1\n            -textureSampling 2\n            -textureDisplay \"modulate\" \n            -textureMaxSize 32768\n            -fogging 0\n            -fogSource \"fragment\" \n            -fogMode \"linear\" \n            -fogStart 0\n            -fogEnd 100\n            -fogDensity 0.1\n            -fogColor 0.5 0.5 0.5 1 \n            -depthOfFieldPreview 1\n            -maxConstantTransparency 1\n            -rendererName \"vp2Renderer\" \n            -objectFilterShowInHUD 1\n            -isFiltered 0\n            -colorResolution 256 256 \n            -bumpResolution 512 512 \n"
		+ "            -textureCompression 0\n            -transparencyAlgorithm \"frontAndBackCull\" \n            -transpInShadows 0\n            -cullingOverride \"none\" \n            -lowQualityLighting 0\n            -maximumNumHardwareLights 1\n            -occlusionCulling 0\n            -shadingModel 0\n            -useBaseRenderer 0\n            -useReducedRenderer 0\n            -smallObjectCulling 0\n            -smallObjectThreshold -1 \n            -interactiveDisableShadows 0\n            -interactiveBackFaceCull 0\n            -sortTransparent 1\n            -controllers 1\n            -nurbsCurves 0\n            -nurbsSurfaces 1\n            -polymeshes 1\n            -subdivSurfaces 1\n            -planes 1\n            -lights 1\n            -cameras 1\n            -controlVertices 1\n            -hulls 1\n            -grid 1\n            -imagePlane 1\n            -joints 1\n            -ikHandles 1\n            -deformers 1\n            -dynamics 1\n            -particleInstancers 1\n            -fluids 1\n            -hairSystems 1\n            -follicles 1\n"
		+ "            -nCloths 1\n            -nParticles 1\n            -nRigids 1\n            -dynamicConstraints 1\n            -locators 1\n            -manipulators 1\n            -pluginShapes 1\n            -dimensions 1\n            -handles 1\n            -pivots 1\n            -textures 1\n            -strokes 1\n            -motionTrails 1\n            -clipGhosts 1\n            -greasePencils 1\n            -shadows 0\n            -captureSequenceNumber -1\n            -width 1174\n            -height 1040\n            -sceneRenderFilter 0\n            $editorName;\n        modelEditor -e -viewSelected 0 $editorName;\n        modelEditor -e \n            -pluginObjects \"gpuCacheDisplayFilter\" 1 \n            $editorName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"outlinerPanel\" (localizedPanelLabel(\"ToggledOutliner\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\toutlinerPanel -edit -l (localizedPanelLabel(\"ToggledOutliner\")) -mbv $menusOkayInPanels  $panelName;\n"
		+ "\t\t$editorName = $panelName;\n        outlinerEditor -e \n            -docTag \"isolOutln_fromSeln\" \n            -showShapes 0\n            -showAssignedMaterials 0\n            -showTimeEditor 1\n            -showReferenceNodes 1\n            -showReferenceMembers 1\n            -showAttributes 0\n            -showConnected 0\n            -showAnimCurvesOnly 0\n            -showMuteInfo 0\n            -organizeByLayer 1\n            -organizeByClip 1\n            -showAnimLayerWeight 1\n            -autoExpandLayers 1\n            -autoExpand 0\n            -showDagOnly 1\n            -showAssets 1\n            -showContainedOnly 1\n            -showPublishedAsConnected 0\n            -showParentContainers 0\n            -showContainerContents 1\n            -ignoreDagHierarchy 0\n            -expandConnections 0\n            -showUpstreamCurves 1\n            -showUnitlessCurves 1\n            -showCompounds 1\n            -showLeafs 1\n            -showNumericAttrsOnly 0\n            -highlightActive 1\n            -autoSelectNewObjects 0\n"
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
		+ "\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"nodeEditorPanel\" (localizedPanelLabel(\"Node Editor\")) `;\n\tif ($nodeEditorPanelVisible || $nodeEditorWorkspaceControlOpen) {\n\t\tif (\"\" == $panelName) {\n\t\t\tif ($useSceneConfig) {\n\t\t\t\t$panelName = `scriptedPanel -unParent  -type \"nodeEditorPanel\" -l (localizedPanelLabel(\"Node Editor\")) -mbv $menusOkayInPanels `;\n\n\t\t\t$editorName = ($panelName+\"NodeEditorEd\");\n            nodeEditor -e \n                -allAttributes 0\n                -allNodes 0\n                -autoSizeNodes 1\n                -consistentNameSize 1\n                -createNodeCommand \"nodeEdCreateNodeCommand\" \n                -connectNodeOnCreation 0\n                -connectOnDrop 0\n                -copyConnectionsOnPaste 0\n                -connectionStyle \"bezier\" \n                -defaultPinnedState 0\n                -additiveGraphingMode 0\n                -settingsChangedCallback \"nodeEdSyncControls\" \n                -traversalDepthLimit -1\n                -keyPressCommand \"nodeEdKeyPressCommand\" \n"
		+ "                -nodeTitleMode \"name\" \n                -gridSnap 0\n                -gridVisibility 1\n                -crosshairOnEdgeDragging 0\n                -popupMenuScript \"nodeEdBuildPanelMenus\" \n                -showNamespace 1\n                -showShapes 1\n                -showSGShapes 0\n                -showTransforms 1\n                -useAssets 1\n                -syncedSelection 1\n                -extendToShapes 1\n                -editorMode \"default\" \n                -hasWatchpoint 0\n                $editorName;\n\t\t\t}\n\t\t} else {\n\t\t\t$label = `panel -q -label $panelName`;\n\t\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Node Editor\")) -mbv $menusOkayInPanels  $panelName;\n\n\t\t\t$editorName = ($panelName+\"NodeEditorEd\");\n            nodeEditor -e \n                -allAttributes 0\n                -allNodes 0\n                -autoSizeNodes 1\n                -consistentNameSize 1\n                -createNodeCommand \"nodeEdCreateNodeCommand\" \n                -connectNodeOnCreation 0\n                -connectOnDrop 0\n"
		+ "                -copyConnectionsOnPaste 0\n                -connectionStyle \"bezier\" \n                -defaultPinnedState 0\n                -additiveGraphingMode 0\n                -settingsChangedCallback \"nodeEdSyncControls\" \n                -traversalDepthLimit -1\n                -keyPressCommand \"nodeEdKeyPressCommand\" \n                -nodeTitleMode \"name\" \n                -gridSnap 0\n                -gridVisibility 1\n                -crosshairOnEdgeDragging 0\n                -popupMenuScript \"nodeEdBuildPanelMenus\" \n                -showNamespace 1\n                -showShapes 1\n                -showSGShapes 0\n                -showTransforms 1\n                -useAssets 1\n                -syncedSelection 1\n                -extendToShapes 1\n                -editorMode \"default\" \n                -hasWatchpoint 0\n                $editorName;\n\t\t\tif (!$useSceneConfig) {\n\t\t\t\tpanel -e -l $label $panelName;\n\t\t\t}\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"createNodePanel\" (localizedPanelLabel(\"Create Node\")) `;\n"
		+ "\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Create Node\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"polyTexturePlacementPanel\" (localizedPanelLabel(\"UV Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"UV Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"renderWindowPanel\" (localizedPanelLabel(\"Render View\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Render View\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"shapePanel\" (localizedPanelLabel(\"Shape Editor\")) `;\n"
		+ "\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tshapePanel -edit -l (localizedPanelLabel(\"Shape Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextPanel \"posePanel\" (localizedPanelLabel(\"Pose Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tposePanel -edit -l (localizedPanelLabel(\"Pose Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"dynRelEdPanel\" (localizedPanelLabel(\"Dynamic Relationships\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Dynamic Relationships\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"relationshipPanel\" (localizedPanelLabel(\"Relationship Editor\")) `;\n"
		+ "\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Relationship Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"referenceEditorPanel\" (localizedPanelLabel(\"Reference Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Reference Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"componentEditorPanel\" (localizedPanelLabel(\"Component Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Component Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"dynPaintScriptedPanelType\" (localizedPanelLabel(\"Paint Effects\")) `;\n"
		+ "\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Paint Effects\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"scriptEditorPanel\" (localizedPanelLabel(\"Script Editor\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Script Editor\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"profilerPanel\" (localizedPanelLabel(\"Profiler Tool\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Profiler Tool\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"contentBrowserPanel\" (localizedPanelLabel(\"Content Browser\")) `;\n"
		+ "\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Content Browser\")) -mbv $menusOkayInPanels  $panelName;\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\t$panelName = `sceneUIReplacement -getNextScriptedPanel \"Stereo\" (localizedPanelLabel(\"Stereo\")) `;\n\tif (\"\" != $panelName) {\n\t\t$label = `panel -q -label $panelName`;\n\t\tscriptedPanel -edit -l (localizedPanelLabel(\"Stereo\")) -mbv $menusOkayInPanels  $panelName;\n{ string $editorName = ($panelName+\"Editor\");\n            stereoCameraView -e \n                -camera \"|persp\" \n                -useInteractiveMode 0\n                -displayLights \"default\" \n                -displayAppearance \"wireframe\" \n                -activeOnly 0\n                -ignorePanZoom 0\n                -wireframeOnShaded 0\n                -headsUpDisplay 1\n                -holdOuts 1\n                -selectionHiliteDisplay 1\n                -useDefaultMaterial 0\n                -bufferMode \"double\" \n                -twoSidedLighting 1\n"
		+ "                -backfaceCulling 0\n                -xray 0\n                -jointXray 0\n                -activeComponentsXray 0\n                -displayTextures 0\n                -smoothWireframe 0\n                -lineWidth 1\n                -textureAnisotropic 0\n                -textureHilight 1\n                -textureSampling 2\n                -textureDisplay \"modulate\" \n                -textureMaxSize 32768\n                -fogging 0\n                -fogSource \"fragment\" \n                -fogMode \"linear\" \n                -fogStart 0\n                -fogEnd 100\n                -fogDensity 0.1\n                -fogColor 0.5 0.5 0.5 1 \n                -depthOfFieldPreview 1\n                -maxConstantTransparency 1\n                -objectFilterShowInHUD 1\n                -isFiltered 0\n                -colorResolution 4 4 \n                -bumpResolution 4 4 \n                -textureCompression 0\n                -transparencyAlgorithm \"frontAndBackCull\" \n                -transpInShadows 0\n                -cullingOverride \"none\" \n"
		+ "                -lowQualityLighting 0\n                -maximumNumHardwareLights 0\n                -occlusionCulling 0\n                -shadingModel 0\n                -useBaseRenderer 0\n                -useReducedRenderer 0\n                -smallObjectCulling 0\n                -smallObjectThreshold -1 \n                -interactiveDisableShadows 0\n                -interactiveBackFaceCull 0\n                -sortTransparent 1\n                -controllers 1\n                -nurbsCurves 1\n                -nurbsSurfaces 1\n                -polymeshes 1\n                -subdivSurfaces 1\n                -planes 1\n                -lights 1\n                -cameras 1\n                -controlVertices 1\n                -hulls 1\n                -grid 1\n                -imagePlane 1\n                -joints 1\n                -ikHandles 1\n                -deformers 1\n                -dynamics 1\n                -particleInstancers 1\n                -fluids 1\n                -hairSystems 1\n                -follicles 1\n                -nCloths 1\n"
		+ "                -nParticles 1\n                -nRigids 1\n                -dynamicConstraints 1\n                -locators 1\n                -manipulators 1\n                -pluginShapes 1\n                -dimensions 1\n                -handles 1\n                -pivots 1\n                -textures 1\n                -strokes 1\n                -motionTrails 1\n                -clipGhosts 1\n                -greasePencils 1\n                -shadows 0\n                -captureSequenceNumber -1\n                -width 0\n                -height 0\n                -sceneRenderFilter 0\n                -displayMode \"centerEye\" \n                -viewColor 0 0 0 1 \n                -useCustomBackground 1\n                $editorName;\n            stereoCameraView -e -viewSelected 0 $editorName;\n            stereoCameraView -e \n                -pluginObjects \"gpuCacheDisplayFilter\" 1 \n                $editorName; };\n\t\tif (!$useSceneConfig) {\n\t\t\tpanel -e -l $label $panelName;\n\t\t}\n\t}\n\n\n\tif ($useSceneConfig) {\n        string $configName = `getPanel -cwl (localizedPanelLabel(\"Current Layout\"))`;\n"
		+ "        if (\"\" != $configName) {\n\t\t\tpanelConfiguration -edit -label (localizedPanelLabel(\"Current Layout\")) \n\t\t\t\t-userCreated false\n\t\t\t\t-defaultImage \"vacantCell.xP:/\"\n\t\t\t\t-image \"\"\n\t\t\t\t-sc false\n\t\t\t\t-configString \"global string $gMainPane; paneLayout -e -cn \\\"single\\\" -ps 1 100 100 $gMainPane;\"\n\t\t\t\t-removeAllPanels\n\t\t\t\t-ap false\n\t\t\t\t\t(localizedPanelLabel(\"Top View\")) \n\t\t\t\t\t\"modelPanel\"\n"
		+ "\t\t\t\t\t\"$panelName = `modelPanel -unParent -l (localizedPanelLabel(\\\"Top View\\\")) -mbv $menusOkayInPanels `;\\n$editorName = $panelName;\\nmodelEditor -e \\n    -camera \\\"|persp\\\" \\n    -useInteractiveMode 0\\n    -displayLights \\\"flat\\\" \\n    -displayAppearance \\\"smoothShaded\\\" \\n    -activeOnly 0\\n    -ignorePanZoom 0\\n    -wireframeOnShaded 0\\n    -headsUpDisplay 1\\n    -holdOuts 1\\n    -selectionHiliteDisplay 1\\n    -useDefaultMaterial 0\\n    -bufferMode \\\"double\\\" \\n    -twoSidedLighting 0\\n    -backfaceCulling 0\\n    -xray 0\\n    -jointXray 0\\n    -activeComponentsXray 0\\n    -displayTextures 1\\n    -smoothWireframe 0\\n    -lineWidth 1\\n    -textureAnisotropic 0\\n    -textureHilight 1\\n    -textureSampling 2\\n    -textureDisplay \\\"modulate\\\" \\n    -textureMaxSize 32768\\n    -fogging 0\\n    -fogSource \\\"fragment\\\" \\n    -fogMode \\\"linear\\\" \\n    -fogStart 0\\n    -fogEnd 100\\n    -fogDensity 0.1\\n    -fogColor 0.5 0.5 0.5 1 \\n    -depthOfFieldPreview 1\\n    -maxConstantTransparency 1\\n    -rendererName \\\"vp2Renderer\\\" \\n    -objectFilterShowInHUD 1\\n    -isFiltered 0\\n    -colorResolution 256 256 \\n    -bumpResolution 512 512 \\n    -textureCompression 0\\n    -transparencyAlgorithm \\\"frontAndBackCull\\\" \\n    -transpInShadows 0\\n    -cullingOverride \\\"none\\\" \\n    -lowQualityLighting 0\\n    -maximumNumHardwareLights 1\\n    -occlusionCulling 0\\n    -shadingModel 0\\n    -useBaseRenderer 0\\n    -useReducedRenderer 0\\n    -smallObjectCulling 0\\n    -smallObjectThreshold -1 \\n    -interactiveDisableShadows 0\\n    -interactiveBackFaceCull 0\\n    -sortTransparent 1\\n    -controllers 1\\n    -nurbsCurves 1\\n    -nurbsSurfaces 1\\n    -polymeshes 1\\n    -subdivSurfaces 1\\n    -planes 1\\n    -lights 1\\n    -cameras 1\\n    -controlVertices 1\\n    -hulls 1\\n    -grid 1\\n    -imagePlane 1\\n    -joints 1\\n    -ikHandles 1\\n    -deformers 1\\n    -dynamics 1\\n    -particleInstancers 1\\n    -fluids 1\\n    -hairSystems 1\\n    -follicles 1\\n    -nCloths 1\\n    -nParticles 1\\n    -nRigids 1\\n    -dynamicConstraints 1\\n    -locators 1\\n    -manipulators 1\\n    -pluginShapes 1\\n    -dimensions 1\\n    -handles 1\\n    -pivots 1\\n    -textures 1\\n    -strokes 1\\n    -motionTrails 1\\n    -clipGhosts 1\\n    -greasePencils 1\\n    -shadows 0\\n    -captureSequenceNumber -1\\n    -width 1174\\n    -height 1040\\n    -sceneRenderFilter 0\\n    $editorName;\\nmodelEditor -e -viewSelected 0 $editorName;\\nmodelEditor -e \\n    -pluginObjects \\\"gpuCacheDisplayFilter\\\" 1 \\n    $editorName\"\n"
		+ "\t\t\t\t\t\"modelPanel -edit -l (localizedPanelLabel(\\\"Top View\\\")) -mbv $menusOkayInPanels  $panelName;\\n$editorName = $panelName;\\nmodelEditor -e \\n    -camera \\\"|persp\\\" \\n    -useInteractiveMode 0\\n    -displayLights \\\"flat\\\" \\n    -displayAppearance \\\"smoothShaded\\\" \\n    -activeOnly 0\\n    -ignorePanZoom 0\\n    -wireframeOnShaded 0\\n    -headsUpDisplay 1\\n    -holdOuts 1\\n    -selectionHiliteDisplay 1\\n    -useDefaultMaterial 0\\n    -bufferMode \\\"double\\\" \\n    -twoSidedLighting 0\\n    -backfaceCulling 0\\n    -xray 0\\n    -jointXray 0\\n    -activeComponentsXray 0\\n    -displayTextures 1\\n    -smoothWireframe 0\\n    -lineWidth 1\\n    -textureAnisotropic 0\\n    -textureHilight 1\\n    -textureSampling 2\\n    -textureDisplay \\\"modulate\\\" \\n    -textureMaxSize 32768\\n    -fogging 0\\n    -fogSource \\\"fragment\\\" \\n    -fogMode \\\"linear\\\" \\n    -fogStart 0\\n    -fogEnd 100\\n    -fogDensity 0.1\\n    -fogColor 0.5 0.5 0.5 1 \\n    -depthOfFieldPreview 1\\n    -maxConstantTransparency 1\\n    -rendererName \\\"vp2Renderer\\\" \\n    -objectFilterShowInHUD 1\\n    -isFiltered 0\\n    -colorResolution 256 256 \\n    -bumpResolution 512 512 \\n    -textureCompression 0\\n    -transparencyAlgorithm \\\"frontAndBackCull\\\" \\n    -transpInShadows 0\\n    -cullingOverride \\\"none\\\" \\n    -lowQualityLighting 0\\n    -maximumNumHardwareLights 1\\n    -occlusionCulling 0\\n    -shadingModel 0\\n    -useBaseRenderer 0\\n    -useReducedRenderer 0\\n    -smallObjectCulling 0\\n    -smallObjectThreshold -1 \\n    -interactiveDisableShadows 0\\n    -interactiveBackFaceCull 0\\n    -sortTransparent 1\\n    -controllers 1\\n    -nurbsCurves 1\\n    -nurbsSurfaces 1\\n    -polymeshes 1\\n    -subdivSurfaces 1\\n    -planes 1\\n    -lights 1\\n    -cameras 1\\n    -controlVertices 1\\n    -hulls 1\\n    -grid 1\\n    -imagePlane 1\\n    -joints 1\\n    -ikHandles 1\\n    -deformers 1\\n    -dynamics 1\\n    -particleInstancers 1\\n    -fluids 1\\n    -hairSystems 1\\n    -follicles 1\\n    -nCloths 1\\n    -nParticles 1\\n    -nRigids 1\\n    -dynamicConstraints 1\\n    -locators 1\\n    -manipulators 1\\n    -pluginShapes 1\\n    -dimensions 1\\n    -handles 1\\n    -pivots 1\\n    -textures 1\\n    -strokes 1\\n    -motionTrails 1\\n    -clipGhosts 1\\n    -greasePencils 1\\n    -shadows 0\\n    -captureSequenceNumber -1\\n    -width 1174\\n    -height 1040\\n    -sceneRenderFilter 0\\n    $editorName;\\nmodelEditor -e -viewSelected 0 $editorName;\\nmodelEditor -e \\n    -pluginObjects \\\"gpuCacheDisplayFilter\\\" 1 \\n    $editorName\"\n"
		+ "\t\t\t\t$configName;\n\n            setNamedPanelLayout (localizedPanelLabel(\"Current Layout\"));\n        }\n\n        panelHistory -e -clear mainPanelHistory;\n        sceneUIReplacement -clear;\n\t}\n\n\ngrid -spacing 5 -size 12 -divisions 5 -displayAxes yes -displayGridLines yes -displayDivisionLines yes -displayPerspectiveLabels no -displayOrthographicLabels no -displayAxesBold yes -perspectiveLabelPosition axis -orthographicLabelPosition edge;\nviewManip -drawCompass 0 -compassAngle 0 -frontParameters \"\" -homeParameters \"\" -selectionLockParameters \"\";\n}\n");
	setAttr ".st" 3;
createNode script -n "sceneConfigurationScriptNode";
	rename -uid "1AA3B9E2-4C55-9616-CE99-7AAF00184821";
	setAttr ".b" -type "string" "playbackOptions -min 1 -max 74 -ast 1 -aet 200 ";
	setAttr ".st" 6;
createNode shadingEngine -n "lambert2SG";
	rename -uid "17EEFAF4-40B1-A090-D589-06975698D854";
	setAttr ".ihi" 0;
	setAttr ".ro" yes;
createNode materialInfo -n "materialInfo2";
	rename -uid "86A73E6B-49FA-83A5-8289-55B00CB1DF19";
createNode file -n "violin_texture";
	rename -uid "1A8F3761-43C7-8B36-9C4B-B3AB3D3322D2";
	setAttr ".ftn" -type "string" "P:/Dropbox/$Gumroad_Store/RIGS/BOUNCYRACOON/sourceimages/violin_texture.jpg";
	setAttr ".ft" 0;
	setAttr ".cs" -type "string" "sRGB";
createNode place2dTexture -n "place2dTexture2";
	rename -uid "5E688371-4627-EBD8-CEC5-329B4291ADF0";
createNode shadingEngine -n "blinn2SG";
	rename -uid "084B5A3A-434B-15F8-A6B8-69B02857C03A";
	setAttr ".ihi" 0;
	setAttr -s 6 ".dsm";
	setAttr ".ro" yes;
createNode materialInfo -n "materialInfo3";
	rename -uid "CAD9EB18-451C-9A56-AE57-DEAE24641DF2";
createNode lambert -n "string_shd";
	rename -uid "339A6A5F-474A-A1A5-FD40-E0B9A0D66C2F";
	setAttr ".c" -type "float3" 1 1 1 ;
createNode shadingEngine -n "lambert3SG";
	rename -uid "120205C0-4D0E-C537-4946-2F8D3600E8C8";
	setAttr ".ihi" 0;
	setAttr -s 2 ".dsm";
	setAttr ".ro" yes;
createNode materialInfo -n "materialInfo4";
	rename -uid "954A03FE-4070-3FBF-71FA-649B4385D5BC";
createNode groupId -n "groupId5";
	rename -uid "B8CE9312-4FC3-0F43-52B0-2EB790990864";
	setAttr ".ihi" 0;
createNode aiOptions -s -n "defaultArnoldRenderOptions";
	rename -uid "2DCD78EC-4828-DAB0-EF1A-BEAE0A24BCA6";
	setAttr ".version" -type "string" "4.2.1";
createNode aiAOVFilter -s -n "defaultArnoldFilter";
	rename -uid "E3F80AC9-4E92-72EC-06D4-B79A5586DA29";
	setAttr ".ai_translator" -type "string" "gaussian";
createNode aiAOVDriver -s -n "defaultArnoldDriver";
	rename -uid "5A4985D2-449D-E3BA-A638-64AB5CEABC79";
	setAttr ".ai_translator" -type "string" "exr";
createNode aiAOVDriver -s -n "defaultArnoldDisplayDriver";
	rename -uid "EE4FED71-490B-B009-D7A3-92944CAB6CFA";
	setAttr ".output_mode" 0;
	setAttr ".ai_translator" -type "string" "maya";
createNode lambert -n "violin_SHD";
	rename -uid "8139397D-4DFB-DA85-DC81-FE8562B5F65F";
createNode nodeGraphEditorInfo -n "hyperShadePrimaryNodeEditorSavedTabsInfo";
	rename -uid "097EA89F-4E97-E68B-8FF4-FC91A813DF7B";
	setAttr ".tgi[0].tn" -type "string" "Untitled_1";
	setAttr ".tgi[0].vl" -type "double2" -330.35712972992997 -324.40474901407543 ;
	setAttr ".tgi[0].vh" -type "double2" 318.45236829822079 337.49998658895549 ;
	setAttr -s 4 ".tgi[0].ni";
	setAttr ".tgi[0].ni[0].x" -252.85714721679688;
	setAttr ".tgi[0].ni[0].y" 145.71427917480469;
	setAttr ".tgi[0].ni[0].nvs" 1923;
	setAttr ".tgi[0].ni[1].x" -252.85714721679688;
	setAttr ".tgi[0].ni[1].y" 194.28572082519531;
	setAttr ".tgi[0].ni[1].nvs" 1923;
	setAttr ".tgi[0].ni[2].x" 54.285713195800781;
	setAttr ".tgi[0].ni[2].y" 145.71427917480469;
	setAttr ".tgi[0].ni[2].nvs" 1923;
	setAttr ".tgi[0].ni[3].x" 54.285713195800781;
	setAttr ".tgi[0].ni[3].y" 194.28572082519531;
	setAttr ".tgi[0].ni[3].nvs" 1923;
select -ne :time1;
	setAttr ".o" 8;
	setAttr ".unw" 8;
select -ne :hardwareRenderingGlobals;
	setAttr ".otfna" -type "stringArray" 22 "NURBS Curves" "NURBS Surfaces" "Polygons" "Subdiv Surface" "Particles" "Particle Instance" "Fluids" "Strokes" "Image Planes" "UI" "Lights" "Cameras" "Locators" "Joints" "IK Handles" "Deformers" "Motion Trails" "Components" "Hair Systems" "Follicles" "Misc. UI" "Ornaments"  ;
	setAttr ".otfva" -type "Int32Array" 22 0 1 1 1 1 1
		 1 1 1 0 0 0 0 0 0 0 0 0
		 0 0 0 0 ;
	setAttr ".fprt" yes;
select -ne :renderPartition;
	setAttr -s 5 ".st";
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
	setAttr ".outf" 51;
	setAttr ".imfkey" -type "string" "exr";
	setAttr ".dss" -type "string" "lambert1";
select -ne :defaultResolution;
	setAttr ".w" 1024;
	setAttr ".h" 1024;
	setAttr ".pa" 1;
	setAttr ".dar" 1;
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
connectAttr "Violin_arch_mesh_parentConstraint1.ctx" "Violin_arch_mesh.tx";
connectAttr "Violin_arch_mesh_parentConstraint1.cty" "Violin_arch_mesh.ty";
connectAttr "Violin_arch_mesh_parentConstraint1.ctz" "Violin_arch_mesh.tz";
connectAttr "Violin_arch_mesh_parentConstraint1.crx" "Violin_arch_mesh.rx";
connectAttr "Violin_arch_mesh_parentConstraint1.cry" "Violin_arch_mesh.ry";
connectAttr "Violin_arch_mesh_parentConstraint1.crz" "Violin_arch_mesh.rz";
connectAttr "Violin_arch_mesh_scaleConstraint1.csx" "Violin_arch_mesh.sx";
connectAttr "Violin_arch_mesh_scaleConstraint1.csy" "Violin_arch_mesh.sy";
connectAttr "Violin_arch_mesh_scaleConstraint1.csz" "Violin_arch_mesh.sz";
connectAttr "Violin_arch_mesh.ro" "Violin_arch_mesh_parentConstraint1.cro";
connectAttr "Violin_arch_mesh.pim" "Violin_arch_mesh_parentConstraint1.cpim";
connectAttr "Violin_arch_mesh.rp" "Violin_arch_mesh_parentConstraint1.crp";
connectAttr "Violin_arch_mesh.rpt" "Violin_arch_mesh_parentConstraint1.crt";
connectAttr "Violinarch_ctrl02.t" "Violin_arch_mesh_parentConstraint1.tg[0].tt";
connectAttr "Violinarch_ctrl02.rp" "Violin_arch_mesh_parentConstraint1.tg[0].trp"
		;
connectAttr "Violinarch_ctrl02.rpt" "Violin_arch_mesh_parentConstraint1.tg[0].trt"
		;
connectAttr "Violinarch_ctrl02.r" "Violin_arch_mesh_parentConstraint1.tg[0].tr";
connectAttr "Violinarch_ctrl02.ro" "Violin_arch_mesh_parentConstraint1.tg[0].tro"
		;
connectAttr "Violinarch_ctrl02.s" "Violin_arch_mesh_parentConstraint1.tg[0].ts";
connectAttr "Violinarch_ctrl02.pm" "Violin_arch_mesh_parentConstraint1.tg[0].tpm"
		;
connectAttr "Violin_arch_mesh_parentConstraint1.w0" "Violin_arch_mesh_parentConstraint1.tg[0].tw"
		;
connectAttr "Violin_arch_mesh.pim" "Violin_arch_mesh_scaleConstraint1.cpim";
connectAttr "Violinarch_ctrl02.s" "Violin_arch_mesh_scaleConstraint1.tg[0].ts";
connectAttr "Violinarch_ctrl02.pm" "Violin_arch_mesh_scaleConstraint1.tg[0].tpm"
		;
connectAttr "Violin_arch_mesh_scaleConstraint1.w0" "Violin_arch_mesh_scaleConstraint1.tg[0].tw"
		;
connectAttr "Violin_mesh_parentConstraint1.ctx" "Violin_mesh.tx";
connectAttr "Violin_mesh_parentConstraint1.cty" "Violin_mesh.ty";
connectAttr "Violin_mesh_parentConstraint1.ctz" "Violin_mesh.tz";
connectAttr "Violin_mesh_parentConstraint1.crx" "Violin_mesh.rx";
connectAttr "Violin_mesh_parentConstraint1.cry" "Violin_mesh.ry";
connectAttr "Violin_mesh_parentConstraint1.crz" "Violin_mesh.rz";
connectAttr "Violin_mesh_scaleConstraint1.csx" "Violin_mesh.sx";
connectAttr "Violin_mesh_scaleConstraint1.csy" "Violin_mesh.sy";
connectAttr "Violin_mesh_scaleConstraint1.csz" "Violin_mesh.sz";
connectAttr "groupId5.id" "Violin_stringsShape.iog.og[0].gid";
connectAttr "lambert3SG.mwc" "Violin_stringsShape.iog.og[0].gco";
connectAttr "blinn2SG.mwc" "Violin_twistiesShape.iog.og[0].gco";
connectAttr "Violin_mesh.ro" "Violin_mesh_parentConstraint1.cro";
connectAttr "Violin_mesh.pim" "Violin_mesh_parentConstraint1.cpim";
connectAttr "Violin_mesh.rp" "Violin_mesh_parentConstraint1.crp";
connectAttr "Violin_mesh.rpt" "Violin_mesh_parentConstraint1.crt";
connectAttr "Violin_ctrl02.t" "Violin_mesh_parentConstraint1.tg[0].tt";
connectAttr "Violin_ctrl02.rp" "Violin_mesh_parentConstraint1.tg[0].trp";
connectAttr "Violin_ctrl02.rpt" "Violin_mesh_parentConstraint1.tg[0].trt";
connectAttr "Violin_ctrl02.r" "Violin_mesh_parentConstraint1.tg[0].tr";
connectAttr "Violin_ctrl02.ro" "Violin_mesh_parentConstraint1.tg[0].tro";
connectAttr "Violin_ctrl02.s" "Violin_mesh_parentConstraint1.tg[0].ts";
connectAttr "Violin_ctrl02.pm" "Violin_mesh_parentConstraint1.tg[0].tpm";
connectAttr "Violin_mesh_parentConstraint1.w0" "Violin_mesh_parentConstraint1.tg[0].tw"
		;
connectAttr "Violin_mesh.pim" "Violin_mesh_scaleConstraint1.cpim";
connectAttr "Violin_ctrl02.s" "Violin_mesh_scaleConstraint1.tg[0].ts";
connectAttr "Violin_ctrl02.pm" "Violin_mesh_scaleConstraint1.tg[0].tpm";
connectAttr "Violin_mesh_scaleConstraint1.w0" "Violin_mesh_scaleConstraint1.tg[0].tw"
		;
relationship "link" ":lightLinker1" ":initialShadingGroup.message" ":defaultLightSet.message";
relationship "link" ":lightLinker1" ":initialParticleSE.message" ":defaultLightSet.message";
relationship "link" ":lightLinker1" "lambert2SG.message" ":defaultLightSet.message";
relationship "link" ":lightLinker1" "blinn2SG.message" ":defaultLightSet.message";
relationship "link" ":lightLinker1" "lambert3SG.message" ":defaultLightSet.message";
relationship "shadowLink" ":lightLinker1" ":initialShadingGroup.message" ":defaultLightSet.message";
relationship "shadowLink" ":lightLinker1" ":initialParticleSE.message" ":defaultLightSet.message";
relationship "shadowLink" ":lightLinker1" "lambert2SG.message" ":defaultLightSet.message";
relationship "shadowLink" ":lightLinker1" "blinn2SG.message" ":defaultLightSet.message";
relationship "shadowLink" ":lightLinker1" "lambert3SG.message" ":defaultLightSet.message";
connectAttr "layerManager.dli[0]" "defaultLayer.id";
connectAttr "renderLayerManager.rlmi[0]" "defaultRenderLayer.rlid";
connectAttr "lambert2SG.msg" "materialInfo2.sg";
connectAttr ":defaultColorMgtGlobals.cme" "violin_texture.cme";
connectAttr ":defaultColorMgtGlobals.cfe" "violin_texture.cmcf";
connectAttr ":defaultColorMgtGlobals.cfp" "violin_texture.cmcp";
connectAttr ":defaultColorMgtGlobals.wsn" "violin_texture.ws";
connectAttr "place2dTexture2.c" "violin_texture.c";
connectAttr "place2dTexture2.tf" "violin_texture.tf";
connectAttr "place2dTexture2.rf" "violin_texture.rf";
connectAttr "place2dTexture2.mu" "violin_texture.mu";
connectAttr "place2dTexture2.mv" "violin_texture.mv";
connectAttr "place2dTexture2.s" "violin_texture.s";
connectAttr "place2dTexture2.wu" "violin_texture.wu";
connectAttr "place2dTexture2.wv" "violin_texture.wv";
connectAttr "place2dTexture2.re" "violin_texture.re";
connectAttr "place2dTexture2.of" "violin_texture.of";
connectAttr "place2dTexture2.r" "violin_texture.ro";
connectAttr "place2dTexture2.n" "violin_texture.n";
connectAttr "place2dTexture2.vt1" "violin_texture.vt1";
connectAttr "place2dTexture2.vt2" "violin_texture.vt2";
connectAttr "place2dTexture2.vt3" "violin_texture.vt3";
connectAttr "place2dTexture2.vc1" "violin_texture.vc1";
connectAttr "place2dTexture2.o" "violin_texture.uv";
connectAttr "place2dTexture2.ofs" "violin_texture.fs";
connectAttr "violin_SHD.oc" "blinn2SG.ss";
connectAttr "Violin_bitsShape2.iog" "blinn2SG.dsm" -na;
connectAttr "Violin_bitsShape3.iog" "blinn2SG.dsm" -na;
connectAttr "Violin_bodyShape.iog" "blinn2SG.dsm" -na;
connectAttr "Violin_bitsShape1.iog" "blinn2SG.dsm" -na;
connectAttr "Violin_archShape.iog" "blinn2SG.dsm" -na;
connectAttr "Violin_twistiesShape.iog" "blinn2SG.dsm" -na;
connectAttr "blinn2SG.msg" "materialInfo3.sg";
connectAttr "violin_SHD.msg" "materialInfo3.m";
connectAttr "violin_texture.msg" "materialInfo3.t" -na;
connectAttr "string_shd.oc" "lambert3SG.ss";
connectAttr "Violin_arch_stringShape.iog" "lambert3SG.dsm" -na;
connectAttr "Violin_stringsShape.iog.og[0]" "lambert3SG.dsm" -na;
connectAttr "groupId5.msg" "lambert3SG.gn" -na;
connectAttr "lambert3SG.msg" "materialInfo4.sg";
connectAttr "string_shd.msg" "materialInfo4.m";
connectAttr ":defaultArnoldDisplayDriver.msg" ":defaultArnoldRenderOptions.drivers"
		 -na;
connectAttr ":defaultArnoldFilter.msg" ":defaultArnoldRenderOptions.filt";
connectAttr ":defaultArnoldDriver.msg" ":defaultArnoldRenderOptions.drvr";
connectAttr "violin_texture.oc" "violin_SHD.c";
connectAttr "string_shd.msg" "hyperShadePrimaryNodeEditorSavedTabsInfo.tgi[0].ni[0].dn"
		;
connectAttr "violin_SHD.msg" "hyperShadePrimaryNodeEditorSavedTabsInfo.tgi[0].ni[1].dn"
		;
connectAttr "lambert3SG.msg" "hyperShadePrimaryNodeEditorSavedTabsInfo.tgi[0].ni[2].dn"
		;
connectAttr "blinn2SG.msg" "hyperShadePrimaryNodeEditorSavedTabsInfo.tgi[0].ni[3].dn"
		;
connectAttr "lambert2SG.pa" ":renderPartition.st" -na;
connectAttr "blinn2SG.pa" ":renderPartition.st" -na;
connectAttr "lambert3SG.pa" ":renderPartition.st" -na;
connectAttr "violin_SHD.msg" ":defaultShaderList1.s" -na;
connectAttr "string_shd.msg" ":defaultShaderList1.s" -na;
connectAttr "place2dTexture2.msg" ":defaultRenderUtilityList1.u" -na;
connectAttr "defaultRenderLayer.msg" ":defaultRenderingList1.r" -na;
connectAttr "violin_texture.msg" ":defaultTextureList1.tx" -na;
// End of Violin_rig_01.ma
