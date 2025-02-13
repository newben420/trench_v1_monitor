# Dex Engine

## Status

Active Development

## Description

This is part of the `Gondola V2` project aimed at developing a dex-based datasource for `Flare` to implement its **Degen Trading Protocol**.

## Requirements

1. Should have reactive persistence.
2. Should implement a Socket.io server where other components can connect to for real-time communication.
3. May be chain-specific, that is, only works with a particular pre-set chain, or just generalized.
4. Should be able to actively watch for new tokens, audit them (market data and socials), and test them against rug pulls, either by itself, or with the help of a neural-network/model component.
5. Should have a watchlist made up of:
    - Tokens being watched by other components (with open trades).
    - New tokens that have been successfully audited.
    - Other tokens deemed necessary for monitoring.
6. For each token on the watchlist, in real-time, it should actively generate OHLCV (Open, High, Low, Close, and Volume) data at a small configured interval/granularity.
7. It should, through its Socket.io server, enable the querying of the OHLCV data by other components at the default granularity, or a wider one by grouping data within its time-range and recalculating compound OHLCV data.
8. It may also enable querying of latest rates of a token through the Socket.io server, as well as endpoints to add a token to the watchlist and remove by a component.
9. It may begin as fully commonJS-based.
10. In addition to OHLCV, it may also keep tabs on Buyers and Sellers data by keeping the granularity-wide average of both. It may be used by the decision-making component to confirm the strength of a trend.

## Notes

-  The decision-making component that would be implemented from this should be able to perform more extensive auditing, integrate Ark's multilayering, focus only on bull entries, and should be robust in detecting true bear-reversals in bull trends. This is necessary to emulate and enhance the degen-trading scanning process.
- The trading component shoud only hold assets, be connected to a DEX or an Aggregator, be chain specific, have a base token (USDT or chain-native), and be able to execute trades, log them, and provide real-time/historical stats.


## Roadmap

After a few hours of research and careful consideration, I have decided that I will be moving my automated trading ahh to the Solana Meme Coin Trenches on PumpDotFun. Long live Solana! May the force be with me!!

Due to this, this repository is now unofficially deprecated as its structure will likely change and it will be part of a different network, possibly private.

See you at the wars. Goodluck!!!