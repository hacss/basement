module Basement.Main where

import Prelude
import Control.Coroutine (consumer)
import Data.Bifoldable (bitraverse_)
import Data.Maybe (Maybe(..))
import Data.Nullable (null)
import Data.String (drop) as S
import Data.Traversable (traverse_)
import Effect (Effect)
import Effect.Class (class MonadEffect, liftEffect)
import Effect.Exception (throw)
import Effect.Ref (new, read, write) as Ref
import Effect.Timer (clearTimeout, setTimeout)
import Foreign (unsafeToForeign)
import Hacss (CSS)
import Halogen (tell)
import Halogen.Aff (awaitBody, runHalogenAff)
import Halogen.VDom.Driver (runUI)
import Web.DOM.Document (createElement)
import Web.DOM.Element (toNode) as Element
import Web.DOM.Node (appendChild, setTextContent)
import Web.HTML (window)
import Web.HTML.History (DocumentTitle(..), URL(..), replaceState)
import Web.HTML.HTMLDocument (head, toDocument)
import Web.HTML.HTMLElement (toNode) as HTMLElement
import Web.HTML.Location (hash)
import Web.HTML.Window (document, history, location)
import Basement.App as App

main :: Effect Unit
main = do
  updateStyleSheet <- initStyle
  save' <- debounce 500 save
  state <- S.drop 1 <$> (hash =<< location =<< window)
  runHalogenAff do
    body <- awaitBody
    { subscribe, query } <- runUI App.component state body
    subscribe
      $ consumer
      $ bitraverse_ updateStyleSheet save' >=> const (pure Nothing)
    query (tell App.Publish)

initStyle :: forall m. MonadEffect m => Effect (CSS -> m Unit)
initStyle = do
  doc <- document =<< window
  maybeHead <- head doc
  case maybeHead of
    Just h -> do
      style <- toDocument doc # createElement "style"
      styleNode <- appendChild (Element.toNode style) (HTMLElement.toNode h)
      pure $ liftEffect <<< flip setTextContent styleNode
    Nothing ->
      throw "Could not locate the head element of the HTML document."

save :: String -> Effect Unit
save s =
  window >>= history >>= replaceState (unsafeToForeign null) (DocumentTitle "") (URL ("#" <> s))

debounce :: forall m a. MonadEffect m => Int -> (a -> Effect Unit) -> Effect (a -> m Unit)
debounce ms f = do
  timeout <- Ref.new Nothing
  pure \x -> liftEffect do
    Ref.read timeout >>= traverse_ clearTimeout
    t <- Just <$> (setTimeout 500 $ f x)
    Ref.write t timeout
