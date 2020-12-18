module Basement.Ace where

import Prelude
import Ace as Ace
import Ace.EditSession as Session
import Ace.Editor as Editor
import Ace.Types (Editor)
import Data.Foldable (traverse_)
import Data.Maybe (Maybe(..))
import Effect.Aff.Class (class MonadAff)
import Halogen (ClassName(..))
import Halogen as H
import Halogen.HTML as HH
import Halogen.HTML.Properties as HP
import Halogen.Query.EventSource as ES

type Slot = H.Slot Query String

data Query a = ChangeText String a

data Action
  = Initialize
  | Finalize
  | HandleChange

type State =
  { editor :: Maybe Editor
  , value :: String
  }

component :: forall m. MonadAff m => H.Component HH.HTML Query String String m
component =
  H.mkComponent
    { initialState
    , render
    , eval: H.mkEval $ H.defaultEval
        { handleAction = handleAction
        , handleQuery = handleQuery
        , initialize = Just Initialize
        , finalize = Just Finalize
        }
    }

initialState :: String -> State
initialState value = { editor: Nothing, value }

render :: forall m. State -> H.ComponentHTML Action () m
render = const $ HH.div [ HP.ref (H.RefLabel "ace"), HP.class_ $ ClassName "position:absolute; inset:0;" ] []

handleAction :: forall m. MonadAff m => Action -> H.HalogenM State Action () String m Unit
handleAction = case _ of
  Initialize -> do
    text <- H.gets _.value
    H.getHTMLElementRef (H.RefLabel "ace") >>= traverse_ \element -> do
      editor <- H.liftEffect $ Ace.editNode element Ace.ace
      session <- H.liftEffect $ Editor.getSession editor
      H.liftEffect do
        Session.setMode "ace/mode/html" session
        Session.setTabSize 2 session
        Editor.setTheme "ace/theme/chrome" editor
        void $ Editor.setValue text Nothing editor
      H.modify_ _ { editor = Just editor }
      void $ H.subscribe $ ES.effectEventSource \emitter -> do
        Session.onChange session (\_ -> ES.emit emitter HandleChange)
        pure mempty
  Finalize -> do
    H.modify_ _ { editor = Nothing }
  HandleChange -> do
    H.gets _.editor >>= traverse_ \editor -> do
      text <- H.liftEffect (Editor.getValue editor)
      H.modify_ _ { value = text }
      H.raise text

handleQuery :: forall m a. MonadAff m => Query a -> H.HalogenM State Action () String m (Maybe a)
handleQuery = case _ of
  ChangeText text next -> do
    maybeEditor <- H.gets _.editor
    case maybeEditor of
      Nothing -> pure unit
      Just editor -> do
        current <- H.liftEffect $ Editor.getValue editor
        when (text /= current) do
          void $ H.liftEffect $ Editor.setValue text Nothing editor
    H.modify_ _ { value = text }
    H.raise text
    pure (Just next)
