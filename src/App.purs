module Basement.App where

import Prelude
import Data.Argonaut (decodeJson, encodeJson, jsonParser)
import Data.Argonaut (stringify) as JSON
import Data.Either (Either(..), either, hush)
import Data.Lens ((%~))
import Data.Lens.Lens.Tuple (_1)
import Data.Maybe (Maybe(..), fromMaybe, isJust)
import Data.Newtype (un)
import Data.Symbol (SProxy(..))
import Data.Tuple (Tuple(..), lookup)
import DOMPurify (sanitize) as DOMPurify
import Effect.Aff.Class (class MonadAff)
import Hacss (AtScope(..), CSS, Variable(..), hacss, printHacssError)
import Halogen as H
import Halogen.HTML as HH
import Halogen.HTML.Events as HE
import Halogen.HTML.Properties as HP
import Html.Renderer.Halogen as RH
import LZString (compressToEncodedURIComponent, decompressFromEncodedURIComponent)
import Basement.Ace as Ace
import Basement.AtScopes as AtScopes
import Basement.CSS (prefix, scope) as CSS
import Basement.HTML (styles)
import Basement.Variables as Variables

type Lookup k = Array (Tuple k String)

type VariablesRep k r = (variables :: Lookup k | r)

type AtScopesRep k r = (atScopes :: Lookup k | r)

type BaseStateRep r =
  ( title :: String
  , markup :: String
  , config :: Boolean
  | r
  )

type State = Record (BaseStateRep (AtScopesRep AtScope (VariablesRep Variable (error :: Maybe String))))

data Action
  = UpdateTitle String
  | UpdateMarkup String
  | OpenConfig
  | CloseConfig
  | UpdateAtScopes (Array (Tuple AtScope String))
  | UpdateVariables (Array (Tuple Variable String))

data Query a = Publish a

instance functorQuery :: Functor Query where
  map f (Publish a) = Publish (f a)

type ChildSlots =
  ( ace :: Ace.Slot Unit
  , atScopes :: AtScopes.Slot Query Unit
  , variables :: Variables.Slot Query Unit
  )

_ace = SProxy :: SProxy "ace"
_atScopes = SProxy :: SProxy "atScopes"
_variables = SProxy :: SProxy "variables"

type URLEncodedState = String

urlEncodeState :: State -> String
urlEncodeState { title, markup, variables, atScopes, config } =
  let
    s =
      { title
      , markup
      , variables: (_1 %~ un Variable) <$> variables
      , atScopes: (_1 %~ un AtScope) <$> atScopes
      , config
      }
  in
    compressToEncodedURIComponent $ JSON.stringify $ encodeJson s

urlDecodeState :: String -> Maybe State
urlDecodeState u =
  (decompressFromEncodedURIComponent u >>= jsonParser >>> hush >>= decodeJson >>> hush)
  <#>
    (\({ title, markup, variables, atScopes, config } :: Record (BaseStateRep (AtScopesRep String (VariablesRep String ())))) ->
      let
        variables' = (_1 %~ Variable) <$> variables
        atScopes' = (_1 %~ AtScope) <$> atScopes
      in
        { title
        , markup
        , variables: variables'
        , atScopes: atScopes'
        , config
        , error: either (Just <<< printHacssError) (const Nothing) $ hacss (flip lookup atScopes') (flip lookup variables') markup
        }
    )

component
  :: forall m
   . MonadAff m
  => H.Component HH.HTML Query URLEncodedState (Tuple CSS URLEncodedState) m
component =
  H.mkComponent
    { initialState
    , eval: H.mkEval H.defaultEval { handleAction = handleAction, handleQuery = handleQuery }
    , render
    }

initialState :: URLEncodedState -> State
initialState =
  fromMaybe { title: "", markup: "", variables: [], atScopes: [], config: false, error: Nothing } <<< urlDecodeState

publish :: forall i m. H.HalogenM State Action i (Tuple CSS URLEncodedState) m Unit
publish = do
  s <- H.get
  case hacss (flip lookup s.atScopes) (flip lookup s.variables) s.markup of
    Right css ->
      let
        state = urlEncodeState s
      in do
        H.raise $ Tuple (CSS.prefix $ CSS.scope (".scope" <> show (hashCode state)) css) state
        H.modify_ _ { error = Nothing }
    Left err -> do
      H.modify_ _ { error = Just $ printHacssError err }
      H.raise $ Tuple "" $ urlEncodeState s

handleAction
  :: forall i m
   . Action
  -> H.HalogenM State Action i (Tuple CSS URLEncodedState) m Unit
handleAction =
  ( case _ of
      UpdateTitle newTitle ->
        H.modify_ _ { title = newTitle }
      UpdateMarkup newMarkup ->
        H.modify_ _ { markup = newMarkup }
      OpenConfig ->
        H.modify_ _ { config = true }
      CloseConfig ->
        H.modify_ _ { config = false }
      UpdateAtScopes newAtScopes ->
        H.modify_ _ { atScopes = newAtScopes }
      UpdateVariables newVariables ->
        H.modify_ _ { variables = newVariables }
  ) >=> \_ -> publish

render :: forall m. MonadAff m => State -> H.ComponentHTML Action ChildSlots m
render s@{ title, markup, atScopes, variables, config, error } =
  HH.div
  [ styles """
    position:absolute;
    inset:0;
    display:flex;
    flex-direction:column;
    align-items:stretch;
    """
  ]
  [ HH.header
    [ styles """
      background:$black;
      padding-x:$space4;
      flex-basis:$space16;
      display:flex;
      align-items:center;
      """
    ]
    [ HH.a
      [ HP.href "https://hacss.io" ]
      [ HH.img
        [ HP.alt "Hacss logo"
        , HP.src "data:image/svg+xml,%3Csvg%20width%3D%22400%22%20height%3D%22512%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22a%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%2262.5%25%22%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%2262.5%25%22%20stop-color%3D%22%23a7a5b6%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20fill%3D%22url(%23a)%22%20d%3D%22M16%200v256l16%2016-32%2032%2032%2032-32%2032%2032%2032-32%2032%2032%2032-32%2032%2016%2016h96V224h128a64%2064%200%200164%2064v224h96V288a160%20160%201%2000-160-160H112V0%22%2F%3E%3C%2Fsvg%3E"
        , styles "height:$space8;"
        ]
      ]
    , HH.input
      [ styles """
        flex:1;
        margin:$space4;
        padding-x:$space1;
        padding-y:0;
        height:calc(100%-2*#{$space4});
        appearance:none;
        outline:none;
        border:0;
        font:$font-title;
        background:transparent;
        color:$dolphin200;
        :hover{background:$dolphin800}
        :focus{background:$dolphin800}
        :focus{box-shadow:0__0__0__1px__#{$dolphin600}}
        :focus{color:$white}
        text-align:center;
        """
      , HP.value title
      , HE.onValueInput $ Just <<< UpdateTitle
      ]
    , HH.button
      [ styles """
        appearance:none;
        outline:none;
        border:0;
        margin:0;
        padding:0;
        width:$space7;
        height:$space7;
        background-color:transparent;
        background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Cpath%20d%3D%22M19.14%2C12.94c0.04-0.3%2C0.06-0.61%2C0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14%2C0.23-0.41%2C0.12-0.61%20l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39%2C0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4%2C2.81c-0.04-0.24-0.24-0.41-0.48-0.41%20h-3.84c-0.24%2C0-0.43%2C0.17-0.47%2C0.41L9.25%2C5.35C8.66%2C5.59%2C8.12%2C5.92%2C7.63%2C6.29L5.24%2C5.33c-0.22-0.08-0.47%2C0-0.59%2C0.22L2.74%2C8.87%20C2.62%2C9.08%2C2.66%2C9.34%2C2.86%2C9.48l2.03%2C1.58C4.84%2C11.36%2C4.8%2C11.69%2C4.8%2C12s0.02%2C0.64%2C0.07%2C0.94l-2.03%2C1.58%20c-0.18%2C0.14-0.23%2C0.41-0.12%2C0.61l1.92%2C3.32c0.12%2C0.22%2C0.37%2C0.29%2C0.59%2C0.22l2.39-0.96c0.5%2C0.38%2C1.03%2C0.7%2C1.62%2C0.94l0.36%2C2.54%20c0.05%2C0.24%2C0.24%2C0.41%2C0.48%2C0.41h3.84c0.24%2C0%2C0.44-0.17%2C0.47-0.41l0.36-2.54c0.59-0.24%2C1.13-0.56%2C1.62-0.94l2.39%2C0.96%20c0.22%2C0.08%2C0.47%2C0%2C0.59-0.22l1.92-3.32c0.12-0.22%2C0.07-0.47-0.12-0.61L19.14%2C12.94z%20M12%2C15.6c-1.98%2C0-3.6-1.62-3.6-3.6%20s1.62-3.6%2C3.6-3.6s3.6%2C1.62%2C3.6%2C3.6S13.98%2C15.6%2C12%2C15.6z%22%20fill%3D%22#{$dolphin200}%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
        :hover{background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Cpath%20d%3D%22M19.14%2C12.94c0.04-0.3%2C0.06-0.61%2C0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14%2C0.23-0.41%2C0.12-0.61%20l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39%2C0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4%2C2.81c-0.04-0.24-0.24-0.41-0.48-0.41%20h-3.84c-0.24%2C0-0.43%2C0.17-0.47%2C0.41L9.25%2C5.35C8.66%2C5.59%2C8.12%2C5.92%2C7.63%2C6.29L5.24%2C5.33c-0.22-0.08-0.47%2C0-0.59%2C0.22L2.74%2C8.87%20C2.62%2C9.08%2C2.66%2C9.34%2C2.86%2C9.48l2.03%2C1.58C4.84%2C11.36%2C4.8%2C11.69%2C4.8%2C12s0.02%2C0.64%2C0.07%2C0.94l-2.03%2C1.58%20c-0.18%2C0.14-0.23%2C0.41-0.12%2C0.61l1.92%2C3.32c0.12%2C0.22%2C0.37%2C0.29%2C0.59%2C0.22l2.39-0.96c0.5%2C0.38%2C1.03%2C0.7%2C1.62%2C0.94l0.36%2C2.54%20c0.05%2C0.24%2C0.24%2C0.41%2C0.48%2C0.41h3.84c0.24%2C0%2C0.44-0.17%2C0.47-0.41l0.36-2.54c0.59-0.24%2C1.13-0.56%2C1.62-0.94l2.39%2C0.96%20c0.22%2C0.08%2C0.47%2C0%2C0.59-0.22l1.92-3.32c0.12-0.22%2C0.07-0.47-0.12-0.61L19.14%2C12.94z%20M12%2C15.6c-1.98%2C0-3.6-1.62-3.6-3.6%20s1.62-3.6%2C3.6-3.6s3.6%2C1.62%2C3.6%2C3.6S13.98%2C15.6%2C12%2C15.6z%22%20fill%3D%22#{$white}%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E')}
        background-size:cover;
        :focus{box-shadow:0__0__0__2px__#{$dolphin400}}
        """
      , HE.onClick $ const $ Just OpenConfig
      ]
      []
    ]
  , HH.div
    [ styles """
      background:$scorpion700;
      padding:$space4;
      flex:1;
      position:relative;
      display:flex;
      flex-direction:column;
      align-items:stretch;
      """
    ]
    [ panel "Markup"
      [ HH.div_ [ HH.slot _ace unit Ace.component markup (Just <<< UpdateMarkup) ]
      ]
      error
    , panel "Preview"
      [ HH.div
        [ styles ("""
          background:#fff;
          color:#000;
          position:absolute;
          inset:0;
          overflow:auto;
          scope""" <> show (hashCode $ urlEncodeState s) ) ]
        [ RH.render_ $ DOMPurify.sanitize markup ]
      ]
      Nothing
    ]
    , HH.div
      [ styles (
          "position:absolute; inset:0; :not(.active){display:none}"
          <> if config then "active" else ""
        )
      , HE.onClick $ const $ Just CloseConfig
      ]
      []
    , HH.div
      [ styles ("""
        background:$lavendar800;
        color:$lavendar200;
        position:absolute;
        top:0;
        right:0;
        bottom:0;
        width:0;
        .open{width:23rem}
        overflow:hidden;
        transition-property:width;
        transition-duration:300ms;
        box-shadow:-#{$space3}__0__#{$space3}__0__rgba(0,0,0,0.5);
        border-y-width:0;
        border-right-width:0;
        border-left-width:1px;
        border-color:$lavendar700;
        border-style:solid;
        """ <> if config then "open" else "")
      ]
      [ HH.div
        [ styles """
          position:absolute;
          top:0;
          right:$space4;
          bottom:0;
          left:$space4;
          """
        ]
        [ HH.header
          [ styles """
            position:absolute;
            top:$space4;
            right:0;
            left:0;
            height:$space8;
            display:flex;
            align-items:center;
            justify-content:space-between;
            z-index:1;
            ::after{content:'__'}
            ::after{position:absolute}
            ::after{right:0}
            ::after{bottom:-#{$space3}}
            ::after{left:0}
            ::after{height:$space4}
            ::after{background:linear-gradient(#{$lavendar800},transparent)}
            """
          ]
          [ HH.h2
            [ styles "font:$font-heading-lg; margin:0;" ]
            [ HH.text "Configuration" ]
          , HH.button
            [ styles """
              appearance:none;
              outline:none;
              margin:0;
              padding:0;
              border:0;
              width:$space7;
              height:$space7;
              background-color:transparent;
              background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%3E%3Cpath%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%205%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012z%22%20fill%3D%22#{$lavendar400}%22%2F%3E%3C%2Fsvg%3E');
              :hover{background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%3E%3Cpath%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%205%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012z%22%20fill%3D%22#{$lavendar100}%22%2F%3E%3C%2Fsvg%3E')}
              background-size:cover;
              :focus{box-shadow:0__0__0__2px__#{$lavendar400}}
              """
            , HE.onClick $ const $ Just CloseConfig
            ]
            []
          ]
        , HH.div
          [ styles """
            position:absolute;
            top:$space12;
            right:0;
            bottom:0;
            left:0;
            overflow-x:hidden;
            overflow-y:auto;
            padding-y:$space4;
            """
          ]
          [ configSection "Variables" [HH.slot _variables unit Variables.component variables (Just <<< UpdateVariables)]
          , configSection "At-Scopes" [HH.slot _atScopes unit AtScopes.component atScopes (Just <<< UpdateAtScopes)]
          ]
        ]
      ]
  ]

  where

    panel title' content err =
      HH.div
      [ styles "flex:1; background:$scorpion700; position:relative;" ]
      [ HH.div
        [ styles ("""
          background:$scorpion800;
          color:$scorpion400;
          .has-error{background:$red600}
          .has-error{color:$white}
          transition-property:background,color;
          transition-duration:150ms;
          position:absolute;
          inset:$space4;
          padding:$space2;
          display:flex;
          flex-direction:column;
          """ <> if isJust err then "has-error" else "")
        ]
        [ HH.div
          [ styles """
            display:flex;
            flex-direction:row;
            align-items:center;
            justify-content:space-between;
            """
          ]
          [ HH.span
            [ styles "font:$font-heading;" ]
            [ HH.text title' ]
          , HH.span
            [ styles "font:$font-status;" ]
            $ fromMaybe [] $ (\e -> [ HH.text e ]) <$> err
          ]
        , HH.div
          [ styles """
            margin-top:$space2;
            position:relative;
            flex:1;
            """
          ]
          content
        ]
      ]

    configSection title' content =
      HH.div
      [ styles "config-section .config-section+{margin-top:$space6}" ]
      [ HH.h3 [ styles "font:$font-heading; margin-x:0; margin-top:0; margin-bottom:$space1;" ] [ HH.text title' ]
      , HH.div_ content
      ]


handleQuery :: forall a m. Query a -> H.HalogenM State Action ChildSlots (Tuple CSS URLEncodedState) m (Maybe a)
handleQuery = case _ of
  Publish x -> do
    publish
    pure $ Just x

foreign import hashCode :: String -> Int
