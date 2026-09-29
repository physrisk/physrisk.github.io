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
NotebookDataLength[      4460,        109]
NotebookOptionsPosition[      4678,        102]
NotebookOutlinePosition[      5237,        121]
CellTagsIndexPosition[      5194,        118]
WindowFrame->Normal*)

(* Beginning of Notebook Content *)
Notebook[{
Cell[BoxData[
 TagBox[
  StyleBox[
   DynamicModuleBox[{$CellContext`a$$ = 0.5, $CellContext`b$$ = 
    5, $CellContext`c$$ = 0, Typeset`show$$ = True, 
    Typeset`bookmarkList$$ = {}, Typeset`bookmarkMode$$ = "Menu", 
    Typeset`animator$$, Typeset`animvar$$ = 1, Typeset`name$$ = 
    "\"untitled\"", Typeset`specs$$ = {{{
       Hold[$CellContext`a$$], 0.5, "A"}, -1, 1}, {{
       Hold[$CellContext`b$$], 5, "\[Nu]"}, 0, 10}, {{
       Hold[$CellContext`c$$], 0, "\[Phi]"}, -Pi, Pi}}, Typeset`size$$ = {
    300., {200., 205.}}, Typeset`update$$ = 0, Typeset`initDone$$, 
    Typeset`skipInitDone$$ = True, $CellContext`a$2101$$ = 
    0, $CellContext`b$2102$$ = 0, $CellContext`c$2103$$ = 0}, 
    DynamicBox[Manipulate`ManipulateBoxes[
     1, StandardForm, 
      "Variables" :> {$CellContext`a$$ = 0.5, $CellContext`b$$ = 
        5, $CellContext`c$$ = 0}, "ControllerVariables" :> {
        Hold[$CellContext`a$$, $CellContext`a$2101$$, 0], 
        Hold[$CellContext`b$$, $CellContext`b$2102$$, 0], 
        Hold[$CellContext`c$$, $CellContext`c$2103$$, 0]}, 
      "OtherVariables" :> {
       Typeset`show$$, Typeset`bookmarkList$$, Typeset`bookmarkMode$$, 
        Typeset`animator$$, Typeset`animvar$$, Typeset`name$$, 
        Typeset`specs$$, Typeset`size$$, Typeset`update$$, Typeset`initDone$$,
         Typeset`skipInitDone$$}, 
      "Body" :> ($CellContext`dt = 0.02; $CellContext`g = 
        Sin[(2 Pi) $CellContext`t] + $CellContext`a$$ 
          Sin[((2 Pi) $CellContext`b$$) $CellContext`t + $CellContext`c$$]; \
$CellContext`f = 
        Table[$CellContext`g, {$CellContext`t, 0, 
           10, $CellContext`dt}]; $CellContext`f2 = 
        Table[{($CellContext`i - 1) $CellContext`dt, 
           Part[$CellContext`f, $CellContext`i]}, {$CellContext`i, 
           Length[$CellContext`f]}]; $CellContext`spec = Part[
          Partition[Abs[
             Fourier[$CellContext`f]]^2, 
           Floor[Length[$CellContext`f]/2]], 1]; $CellContext`spec2 = 
        Table[{$CellContext`i/(Length[$CellContext`f] $CellContext`dt), 
           Part[$CellContext`spec, $CellContext`i]}, {$CellContext`i, 2, 
           Length[$CellContext`spec]}]; Column[{
          
          ListPlot[$CellContext`f2, Joined -> True, ImageSize -> {300, 200}, 
           Axes -> False, Frame -> True, FrameLabel -> {"x, s", "f(x)"}], 
          
          ListPlot[$CellContext`spec2, Joined -> True, PlotRange -> All, 
           ImageSize -> {300, 200}, Axes -> False, Frame -> True, 
           FrameLabel -> {"\[Nu], Hz", "S(\[Nu])"}]}]), 
      "Specifications" :> {{{$CellContext`a$$, 0.5, "A"}, -1, 
         1}, {{$CellContext`b$$, 5, "\[Nu]"}, 0, 
         10}, {{$CellContext`c$$, 0, "\[Phi]"}, -Pi, Pi}}, 
      "Options" :> {ContinuousAction -> False, AppearanceElements -> None}, 
      "DefaultOptions" :> {}],
     ImageSizeCache->{349., {265., 270.}},
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
 Deployed->True,
 GeneratedCell->False,
 CellAutoOverwrite->False,
 ShowCellLabel->False,
 CellChangeTimes->{
  3.5680060252713714`*^9, {3.5680062793968177`*^9, 3.568006306400465*^9}}]
},
WindowSize->{707, 637},
WindowMargins->{{Automatic, 117}, {Automatic, 33}},
FrontEndVersion->"8.0 for Microsoft Windows (64-bit) (February 23, 2011)",
StyleDefinitions->Notebook[{
   Cell[
    StyleData[StyleDefinitions -> "Default.nb"]]}, Visible -> False, 
  FrontEndVersion -> "8.0 for Microsoft Windows (64-bit) (February 23, 2011)",
   StyleDefinitions -> "PrivateStylesheetFormatting.nb"]
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
Cell[1235, 30, 3439, 70, 537, "Output"]
}
]
*)

(* End of internal cache information *)

(* NotebookSignature BxTnNuGsf#nImD125KOx3clU *)
