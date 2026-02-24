(* Content-type: application/vnd.wolfram.cdf.text *)

(*** Wolfram CDF File ***)
(* http://www.wolfram.com/cdf *)

(* CreatedBy='Mathematica 8.0' *)

(*************************************************************************)
(*                                                                       *)
(*  The Mathematica License under which this file was created prohibits  *)
(*  restricting third parties in receipt of this file from republishing  *)
(*  or redistributing it by any means, including but not limited to      *)
(*  rights management or terms of use, without the express consent of    *)
(*  Wolfram Research, Inc.                                               *)
(*                                                                       *)
(*************************************************************************)

(*CacheID: 234*)
(* Internal cache information:
NotebookFileLineBreakTest
NotebookFileLineBreakTest
NotebookDataPosition[       835,         17]
NotebookDataLength[      6031,        137]
NotebookOptionsPosition[      6462,        134]
NotebookOutlinePosition[      6807,        149]
CellTagsIndexPosition[      6764,        146]
WindowFrame->Normal*)

(* Beginning of Notebook Content *)
Notebook[{
Cell[BoxData[
 TagBox[
  StyleBox[
   DynamicModuleBox[{$CellContext`a1$$ = 20, $CellContext`a2$$ = 
    30, $CellContext`c12$$ = 1, $CellContext`c21$$ = 1, $CellContext`t1$$ = 
    1, $CellContext`x10$$ = 8, $CellContext`x20$$ = 12, Typeset`show$$ = True,
     Typeset`bookmarkList$$ = {}, Typeset`bookmarkMode$$ = "Menu", 
    Typeset`animator$$, Typeset`animvar$$ = 1, Typeset`name$$ = 
    "\"untitled\"", Typeset`specs$$ = {{{
       Hold[$CellContext`a1$$], 20, "\!\(\*SubscriptBox[\(a\), \(1\)]\)"}, 0, 
      100}, {{
       Hold[$CellContext`a2$$], 30, "\!\(\*SubscriptBox[\(a\), \(2\)]\)"}, 0, 
      100}, {{
       Hold[$CellContext`c12$$], 1, "\!\(\*SubscriptBox[\(c\), \(12\)]\)"}, 0,
       100}, {{
       Hold[$CellContext`c21$$], 1, "\!\(\*SubscriptBox[\(c\), \(21\)]\)"}, 0,
       100}, {{
       Hold[$CellContext`t1$$], 1, "\!\(\*SubscriptBox[\(t\), \(max\)]\)"}, 
      0.01, 10, 0.05}, {{
       Hold[$CellContext`x10$$], 8, "\!\(\*SubscriptBox[\(X\), \(1\)]\)(0)"}, 
      0, 100}, {{
       Hold[$CellContext`x20$$], 12, "\!\(\*SubscriptBox[\(X\), \(2\)]\)(0)"},
       0, 100}}, Typeset`size$$ = {300., {98., 102.}}, Typeset`update$$ = 0, 
    Typeset`initDone$$, Typeset`skipInitDone$$ = 
    True, $CellContext`a1$5897$$ = 0, $CellContext`a2$5898$$ = 
    0, $CellContext`c12$5899$$ = 0, $CellContext`c21$5900$$ = 
    0, $CellContext`t1$5901$$ = 0, $CellContext`x10$5902$$ = 
    0, $CellContext`x20$5903$$ = 0}, 
    DynamicBox[Manipulate`ManipulateBoxes[
     1, StandardForm, 
      "Variables" :> {$CellContext`a1$$ = 20, $CellContext`a2$$ = 
        30, $CellContext`c12$$ = 1, $CellContext`c21$$ = 1, $CellContext`t1$$ = 
        1, $CellContext`x10$$ = 8, $CellContext`x20$$ = 12}, 
      "ControllerVariables" :> {
        Hold[$CellContext`a1$$, $CellContext`a1$5897$$, 0], 
        Hold[$CellContext`a2$$, $CellContext`a2$5898$$, 0], 
        Hold[$CellContext`c12$$, $CellContext`c12$5899$$, 0], 
        Hold[$CellContext`c21$$, $CellContext`c21$5900$$, 0], 
        Hold[$CellContext`t1$$, $CellContext`t1$5901$$, 0], 
        Hold[$CellContext`x10$$, $CellContext`x10$5902$$, 0], 
        Hold[$CellContext`x20$$, $CellContext`x20$5903$$, 0]}, 
      "OtherVariables" :> {
       Typeset`show$$, Typeset`bookmarkList$$, Typeset`bookmarkMode$$, 
        Typeset`animator$$, Typeset`animvar$$, Typeset`name$$, 
        Typeset`specs$$, Typeset`size$$, Typeset`update$$, Typeset`initDone$$,
         Typeset`skipInitDone$$}, "Body" :> ($CellContext`sol = Quiet[
          
          NDSolve[{
           Derivative[
             1][$CellContext`x1][$CellContext`t] == $CellContext`a1$$ \
$CellContext`x1[$CellContext`t] - $CellContext`c12$$ \
$CellContext`x1[$CellContext`t] $CellContext`x2[$CellContext`t], 
            Derivative[
             1][$CellContext`x2][$CellContext`t] == (-$CellContext`a2$$) \
$CellContext`x2[$CellContext`t] + $CellContext`c21$$ \
$CellContext`x1[$CellContext`t] $CellContext`x2[$CellContext`t], \
$CellContext`x1[0] == $CellContext`x10$$, $CellContext`x2[
             0] == $CellContext`x20$$}, {$CellContext`x1, $CellContext`x2}, \
{$CellContext`t, 0, $CellContext`t1$$}]]; $CellContext`fun = Quiet[
          Flatten[
           ReplaceAll[{
             $CellContext`x1[$CellContext`t], 
             $CellContext`x2[$CellContext`t]}, $CellContext`sol]]]; 
       Plot[{$CellContext`fun, $CellContext`a2$$/$CellContext`c21$$, \
$CellContext`a1$$/$CellContext`c12$$}, {$CellContext`t, 0, $CellContext`t1$$},
          PlotRange -> All, Axes -> False, Frame -> True, 
         PlotStyle -> {Blue, Red, {Blue, Dashed}, {Red, Dashed}}, 
         ImageSize -> {300, 200}]), 
      "Specifications" :> {{{$CellContext`a1$$, 20, 
          "\!\(\*SubscriptBox[\(a\), \(1\)]\)"}, 0, 100, ImageSize -> 
         Tiny}, {{$CellContext`a2$$, 30, 
          "\!\(\*SubscriptBox[\(a\), \(2\)]\)"}, 0, 100, ImageSize -> 
         Tiny}, {{$CellContext`c12$$, 1, 
          "\!\(\*SubscriptBox[\(c\), \(12\)]\)"}, 0, 100, ImageSize -> 
         Tiny}, {{$CellContext`c21$$, 1, 
          "\!\(\*SubscriptBox[\(c\), \(21\)]\)"}, 0, 100, ImageSize -> Tiny}, 
        Delimiter, {{$CellContext`t1$$, 1, 
          "\!\(\*SubscriptBox[\(t\), \(max\)]\)"}, 0.01, 10, 0.05, ImageSize -> 
         Tiny}, Delimiter, {{$CellContext`x10$$, 8, 
          "\!\(\*SubscriptBox[\(X\), \(1\)]\)(0)"}, 0, 100, ImageSize -> 
         Tiny}, {{$CellContext`x20$$, 12, 
          "\!\(\*SubscriptBox[\(X\), \(2\)]\)(0)"}, 0, 100, ImageSize -> 
         Tiny}}, "Options" :> {
       ContinuousAction -> False, ControlPlacement -> Left, 
        AppearanceElements -> None}, "DefaultOptions" :> {}],
     ImageSizeCache->{468., {120., 125.}},
     SingleEvaluation->True],
    Deinitialization:>None,
    DynamicModuleValues:>{},
    SynchronousInitialization->True,
    UnsavedVariables:>{Typeset`initDone$$},
    UntrackedVariables:>{Typeset`size$$}], "Manipulate",
   Deployed->True,
   StripOnInput->False],
  Manipulate`InterpretManipulate[1]]], "Output",
 ShowCellBracket->False,
 CellMargins->{{0, 0}, {0, 0}},
 CellBracketOptions->{"Margins"->{0, 0},
 "Thickness"->0,
 "Widths"->{0, 0}},
 Deployed->True,
 ShowCellLabel->False,
 CellChangeTimes->{3.5692982475040545`*^9}]
},
WindowSize->{707, 637},
WindowMargins->{{Automatic, 312}, {Automatic, 9}},
FrontEndVersion->"8.0 for Microsoft Windows (32-bit) (February 23, 2011)",
StyleDefinitions->"Default.nb"
]
(* End of Notebook Content *)

(* Internal cache information *)
(*CellTagsOutline
CellTagsIndex->{}
*)
(*CellTagsIndex
CellTagsIndex->{}
*)
(*NotebookFileOutline
Notebook[{
Cell[1235, 30, 5223, 102, 247, "Output"]
}
]
*)

(* End of internal cache information *)

(* NotebookSignature 8wTfDjaCeqHNKDwkHd5W#TT9 *)
