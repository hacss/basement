module Basement.KeyValue where

import Prelude
import Data.Array (filter, snoc) as A
import Data.FunctorWithIndex (mapWithIndex)
import Data.Lens ((.~))
import Data.Lens.Index (ix)
import Data.Lens.Lens.Tuple (_1, _2)
import Data.Maybe (Maybe(..))
import Data.String.Common (null) as S
import Data.Tuple (Tuple(..))
import Halogen (Component, HalogenM)
import Halogen as H
import Halogen.HTML as HH
import Halogen.HTML.Events as HE
import Halogen.HTML.Properties as HP
import Basement.HTML (styles)

type Index = Int

type Key = String

type Value = String

type Model = Array (Tuple Key Value)

data Action
  = SetKey Index Key
  | SetValue Index Value
  | Add

component :: forall q m. Component HH.HTML q Model Model m
component = H.mkComponent
  { initialState: identity
  , render
  , eval: H.mkEval H.defaultEval { handleAction = handleAction }
  }

render :: forall m. Model -> H.ComponentHTML Action () m
render kvs = HH.div_ $
  mapWithIndex renderKV kvs
    `A.snoc`
    HH.button
      [ styles """
        appearance:none;
        border:0;
        margin-x:0;
        margin-bottom:0;
        margin-top:$space1;
        padding-x:0.25rem;
        padding-y:0.125rem;
        background:$lavendar900;
        color:$lavendar300;
        font:$font-button;
        display:flex;
        align-items:center;
        box-sizing:border-box;
        outline:none;
        :focus{box-shadow:0__0__0__1px__#{$lavendar600}}
        :hover{background:$lavendar700}
        :hover{color:$lavendar100}
        """
      , HE.onClick $ const $ Just Add
      ]
      [ HH.span [ styles "font-size:2em; font-family:monospace;" ] [ HH.text "+" ]
      , HH.span [ styles "display:inline-block; margin-left:0.25em;" ] [ HH.text "Add" ]
      ]
  where
    renderKV i (Tuple k v) =
      HH.div
      [ styles "display:flex; margin-x:-#{$space1};" ]
      [ HH.input
        [ styles inputStyles
        , HP.value k
        , HE.onValueInput $ Just <<< SetKey i
        ]
      , HH.input 
        [ styles inputStyles
        , HP.value v
        , HE.onValueInput $ Just <<< SetValue i
        ]
      ]
    inputStyles = """
      appearance:none;
      margin:$space1;
      padding:$space1;
      border:0;
      background:$lavendar700;
      color:$lavendar100;
      outline:none;
      font:$font-input;
      width:calc(50%-#{$space1});
      box-sizing:border-box;
      :focus{box-shadow:0__0__0__1px__#{$lavendar600}}
      """

handleAction :: forall m. Action -> HalogenM Model Action () Model m Unit
handleAction =
  case _ of
    Add ->
      H.modify_ $ flip A.snoc (Tuple "" "")
    SetKey i k -> do
      H.modify_ $ (ix i <<< _1) .~ k
      kvs <- H.gets $ A.filter \(Tuple a b) -> not (S.null a || S.null b)
      H.raise kvs
    SetValue i v -> do
      H.modify_ $ (ix i <<< _2) .~ v
      kvs <- H.gets $ A.filter \(Tuple a b) -> not (S.null a || S.null b)
      H.raise kvs
