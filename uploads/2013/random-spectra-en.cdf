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
NotebookDataLength[      7557,        168]
NotebookOptionsPosition[      7988,        165]
NotebookOutlinePosition[      8333,        180]
CellTagsIndexPosition[      8290,        177]
WindowFrame->Normal*)

(* Beginning of Notebook Content *)
Notebook[{
Cell[BoxData[
 TagBox[
  StyleBox[
   DynamicModuleBox[{$CellContext`gama$$ = 0, $CellContext`mode$$ = 
    1, $CellContext`s$$ = 1, Typeset`show$$ = True, 
    Typeset`bookmarkList$$ = {}, Typeset`bookmarkMode$$ = "Menu", 
    Typeset`animator$$, Typeset`animvar$$ = 1, Typeset`name$$ = 
    "\"untitled\"", Typeset`specs$$ = {{{
       Hold[$CellContext`s$$], 1, "\[Sigma]"}, 0, 4}, {{
       Hold[$CellContext`gama$$], 0, "\[Gamma]"}, 0, 0.3}, {{
       Hold[$CellContext`mode$$], 1, "f(t)="}, {
      1 -> "White noise", 2 -> "Brownian motion", 3 -> "Geometric BM"}}}, 
    Typeset`size$$ = {300., {200., 205.}}, Typeset`update$$ = 0, 
    Typeset`initDone$$, Typeset`skipInitDone$$ = 
    True, $CellContext`s$28573$$ = 0, $CellContext`gama$28574$$ = 
    0, $CellContext`mode$28575$$ = False}, 
    DynamicBox[Manipulate`ManipulateBoxes[
     1, StandardForm, 
      "Variables" :> {$CellContext`gama$$ = 0, $CellContext`mode$$ = 
        1, $CellContext`s$$ = 1}, "ControllerVariables" :> {
        Hold[$CellContext`s$$, $CellContext`s$28573$$, 0], 
        Hold[$CellContext`gama$$, $CellContext`gama$28574$$, 0], 
        Hold[$CellContext`mode$$, $CellContext`mode$28575$$, False]}, 
      "OtherVariables" :> {
       Typeset`show$$, Typeset`bookmarkList$$, Typeset`bookmarkMode$$, 
        Typeset`animator$$, Typeset`animvar$$, Typeset`name$$, 
        Typeset`specs$$, Typeset`size$$, Typeset`update$$, Typeset`initDone$$,
         Typeset`skipInitDone$$}, "Body" :> (If[
         Not[
          
          ValueQ[$CellContext`previousMode]], $CellContext`previousMode = -1; \
$CellContext`previousS = -1; $CellContext`previousG = -1; $CellContext`f = 
          Null; $CellContext`df = 1; Null]; If[
         Or[$CellContext`mode$$ != $CellContext`previousMode, \
$CellContext`previousS != $CellContext`s$$, $CellContext`previousG != \
$CellContext`gama$$], If[
           
           Or[$CellContext`f == 
            Null, $CellContext`previousS != $CellContext`s$$], $CellContext`f = 
            Table[{$CellContext`i, 
               RandomReal[
                NormalDistribution[0, $CellContext`s$$]]}, {$CellContext`i, 0,
                1000, $CellContext`df}]; Null]; $CellContext`g = Null; 
         If[$CellContext`mode$$ == 
           2, $CellContext`last = 0; $CellContext`g = Table[{
               Part[$CellContext`f, $CellContext`i, 1], 
               
               AddTo[$CellContext`last, 
                Part[$CellContext`f, $CellContext`i, 
                  2] - $CellContext`gama$$ $CellContext`last]}, \
{$CellContext`i, 
               Length[$CellContext`f]}]; Null, 
           If[$CellContext`mode$$ == 
             3, $CellContext`last = 0; $CellContext`g = Table[{
                 Part[$CellContext`f, $CellContext`i, 1], 
                 AddTo[$CellContext`last, 
                  Part[$CellContext`f, $CellContext`i, 2]]}, {$CellContext`i, 
                 Length[$CellContext`f]}]; $CellContext`h = Table[{
                 Part[$CellContext`f, $CellContext`i, 1], 10^
                 Part[$CellContext`g, $CellContext`i, 2]}, {$CellContext`i, 
                 
                 Length[$CellContext`f]}]; $CellContext`g = $CellContext`h; \
$CellContext`h = {}; Null]; Null]; 
         If[$CellContext`g == Null, $CellContext`g = $CellContext`f; 
           Null]; $CellContext`gr = Null; 
         If[$CellContext`mode$$ != 
           3, $CellContext`gr = 
            ListPlot[$CellContext`g, Joined -> True, PlotRange -> All]; 
           Null, $CellContext`gr = 
            ListLogPlot[$CellContext`g, Joined -> True, PlotRange -> All]; 
           Null]; $CellContext`previousMode = $CellContext`mode$$; \
$CellContext`previousS = $CellContext`s$$; $CellContext`previousG = \
$CellContext`gama$$; $CellContext`h = Part[
            Transpose[$CellContext`g], 2]; $CellContext`spec = Part[
            Partition[Abs[
               Fourier[$CellContext`h]]^2, 
             Floor[Length[$CellContext`h]/2]], 1]; $CellContext`specOut = 
          Table[{$CellContext`i/(Length[$CellContext`h] $CellContext`df), 
             Part[$CellContext`spec, $CellContext`i]}, {$CellContext`i, 
             Length[$CellContext`spec]}]; $CellContext`specOut = 
          Drop[$CellContext`specOut, 1]; $CellContext`specOut = 
          MovingAverage[$CellContext`specOut, 5]; $CellContext`gr2 = 
          ListLogLogPlot[$CellContext`specOut, Joined -> True, PlotRange -> 
            All]; $CellContext`gr3 = 
          LogLogPlot[$CellContext`s$$^2, {$CellContext`nu, 
             Part[
              First[$CellContext`specOut], 1], 
             Part[
              Last[$CellContext`specOut], 1]}, PlotStyle -> Red]; 
         If[$CellContext`mode$$ == 
           2, $CellContext`gr3 = 
            LogLogPlot[(2 $CellContext`s$$^2)/(
              4 $CellContext`gama$$^2 + (4 
                Pi^2) $CellContext`nu^2), {$CellContext`nu, 
               Part[
                First[$CellContext`specOut], 1], 
               Part[
                Last[$CellContext`specOut], 1]}, PlotStyle -> Red]; Null, 
           If[$CellContext`mode$$ == 3, $CellContext`gr3 = LogLogPlot[
                Part[
                 First[$CellContext`specOut], 2], {$CellContext`nu, 
                 Part[$CellContext`specOut, 1, 1], 
                 Part[$CellContext`specOut, 2, 1]}, PlotStyle -> Red]; Null]; 
           Null]; $CellContext`h = {}; $CellContext`spec = {}; Null]; Column[{
          
          Show[$CellContext`gr, PlotRange -> All, Axes -> False, Frame -> 
           True, FrameLabel -> {"t, s", "f(t)"}, ImageSize -> {300, 200}], 
          
          Show[$CellContext`gr2, $CellContext`gr3, PlotRange -> All, Axes -> 
           False, Frame -> True, FrameLabel -> {"\[Nu], Hz", "S(\[Nu])"}, 
           ImageSize -> {300, 200}]}]), 
      "Specifications" :> {{{$CellContext`s$$, 1, "\[Sigma]"}, 0, 
         4}, {{$CellContext`gama$$, 0, "\[Gamma]"}, 0, 
         0.3}, {{$CellContext`mode$$, 1, "f(t)="}, {
         1 -> "White noise", 2 -> "Brownian motion", 3 -> "Geometric BM"}}}, 
      "Options" :> {ContinuousAction -> False, AppearanceElements -> None}, 
      "DefaultOptions" :> {}],
     ImageSizeCache->{349., {263., 268.}},
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
 ShowCellLabel->False,
 CellChangeTimes->{
  3.5680972692658153`*^9, 3.568097396608839*^9, {3.568097467557763*^9, 
   3.5680974760753784`*^9}}]
},
WindowSize->{707, 637},
WindowMargins->{{72, Automatic}, {38, Automatic}},
FrontEndVersion->"8.0 for Microsoft Windows (64-bit) (February 23, 2011)",
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
Cell[1235, 30, 6749, 133, 533, "Output"]
}
]
*)

(* End of internal cache information *)

(* NotebookSignature gwDHrNNEc4tHTCwu3z9ruyr3 *)
