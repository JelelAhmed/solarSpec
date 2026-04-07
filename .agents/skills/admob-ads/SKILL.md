---
name: admob-ads
description: Use when placing, configuring, or debugging
AdMob banner or interstitial ads.
---

## Placement rules

Banner ads on these screens only:
  Home screen: bottom of screen, centred, above safe area
  Load Input screen: between last appliance card and
    the Add Appliance bottom sheet handle area
  Component List screen: between total cost card
    and Generate Proposal button

Interstitial ad:
  Triggers on "Generate Proposal" button tap only
  Must complete or be dismissed before PDF generation starts
  Never show interstitial more than once per proposal generation
  Pre-load interstitial when Component List screen mounts

Never place ads on:
  Client Details, System Configuration, System Sizing,
  System Diagram, Proposal Preview, Settings

## Banner specs

Width: 320px fixed, height: 50px
Centred horizontally on screen
Use BannerAd component from react-native-google-mobile-ads
size: BannerAdSize.BANNER (320x50)

Development placeholder (before real IDs):
  View: width:320 height:50 backgroundColor:'#353534'
  borderRadius:4 borderWidth:1 borderColor:rgba(82,69,52,0.3)
  Label: "AdMob Banner" Inter 10 weight:700 uppercase
         letterSpacing:3 color:rgba(215,195,174,0.6)

## Test IDs (development only — hardcoded in ads.js)

Android banner:       ca-app-pub-3940256099942544/6300978111
Android interstitial: ca-app-pub-3940256099942544/1033173712
iOS banner:           ca-app-pub-3940256099942544/2934735716
iOS interstitial:     ca-app-pub-3940256099942544/4411468910

## Real IDs (production — placeholder in ads.js)

Replace test IDs with real AdMob unit IDs before Play Store
and App Store submission. Structure in ads.js:

const adUnitIds = {
  banner: Platform.select({
    android: 'REAL_ANDROID_BANNER_ID',
    ios: 'REAL_IOS_BANNER_ID',
  }),
  interstitial: Platform.select({
    android: 'REAL_ANDROID_INTERSTITIAL_ID',
    ios: 'REAL_IOS_INTERSTITIAL_ID',
  }),
};

## Interstitial implementation

// Pre-load on Component List mount
const interstitialAd = InterstitialAd.createForAdRequest(adUnitIds.interstitial);

useEffect(() => {
  interstitialAd.load();
}, []);

// On Generate Proposal tap
const handleGenerateProposal = () => {
  if (interstitialAd.loaded) {
    interstitialAd.show();
    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      // proceed to PDF generation
      generatePDF();
    });
  } else {
    // ad not loaded — proceed without ad
    generatePDF();
  }
};

## iOS requirements

Add to app.json:
  "plugins": [["react-native-google-mobile-ads", {
    "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
    "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
  }]]

Always verify ad is loaded before showing interstitial.
Never block PDF generation if ad fails to load.
