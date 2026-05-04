import Toybox.Activity;
import Toybox.Application;
import Toybox.Graphics;
import Toybox.Lang;
import Toybox.WatchUi;

class crossoverhelperView extends WatchUi.DataField {

    hidden var mValue as Numeric;
    hidden var mPayloadString as String;
    hidden var mIntersectionCount as Number;
    hidden var mLatitudes as Array;
    hidden var mLongitudes as Array;
    hidden var mRadii as Array;
    hidden var mExitCounts as Array;
    hidden var mExitOffsets as Array;
    hidden var mExitCoords as Array;

    function initialize() {
        DataField.initialize();
        mValue = 0.0f;
        mPayloadString = "";
        mIntersectionCount = 0;
        mLatitudes = new Array();
        mLongitudes = new Array();
        mRadii = new Array();
        mExitCounts = new Array();
        mExitOffsets = new Array();
        mExitCoords = new Array();
        loadPayloadFromSettings();
    }

    hidden function loadPayloadFromSettings() as Void {
        var payloadString = Application.Properties.getValue("PayloadString") as String or Null;
        if (payloadString == null) {
            payloadString = "";
        }

        if (payloadString == mPayloadString) {
            return;
        }
        mPayloadString = payloadString;
        parsePayloadString(payloadString);
    }

    hidden function parsePayloadString(payloadString as String) as Void {
        mIntersectionCount = 0;
        mLatitudes = new Array();
        mLongitudes = new Array();
        mRadii = new Array();
        mExitCounts = new Array();
        mExitOffsets = new Array();
        mExitCoords = new Array();

        if (payloadString == null || payloadString.length() == 0) {
            return;
        }

        var pos = [0];
        while (true) {
            var lat = readNextNumber(payloadString, pos);
            if (lat == null) {
                break;
            }

            var lon = readNextNumber(payloadString, pos);
            if (lon == null) {
                break;
            }

            var radius = readNextNumber(payloadString, pos);
            if (radius == null) {
                break;
            }

            var exitCountValue = readNextNumber(payloadString, pos);
            if (exitCountValue == null) {
                break;
            }

            var exitCount = exitCountValue as Number;
            if (exitCount < 0) {
                break;
            }

            mLatitudes.add(lat);
            mLongitudes.add(lon);
            mRadii.add(radius);
            mExitCounts.add(exitCount);
            mExitOffsets.add(mExitCoords.size());

            for (var i = 0; i < exitCount; i += 1) {
                var exitLat = readNextNumber(payloadString, pos);
                var exitLon = readNextNumber(payloadString, pos);
                if (exitLat == null || exitLon == null) {
                    return;
                }
                mExitCoords.add(exitLat);
                mExitCoords.add(exitLon);
            }
            mIntersectionCount += 1;
        }
    }

    hidden function readNextNumber(payloadString as String, posArray as Array) as Number or Null {
        var length = payloadString.length();
        var pos = posArray[0];

        while (pos < length) {
            var ch = payloadString.substring(pos, pos + 1);
            if (ch.equals(" ") || ch.equals("\t") || ch.equals("\n") || ch.equals("\r") || ch.equals(",") || ch.equals(";") || ch.equals("|")) {
                pos += 1;
                continue;
            }
            break;
        }

        if (pos >= length) {
            posArray[0] = pos;
            return null;
        }

        var start = pos;
        while (pos < length) {
            var ch = payloadString.substring(pos, pos + 1);
            if (ch.equals(" ") || ch.equals("\t") || ch.equals("\n") || ch.equals("\r") || ch.equals(",") || ch.equals(";") || ch.equals("|")) {
                break;
            }
            pos += 1;
        }

        var token = payloadString.substring(start, pos);
        posArray[0] = pos;
        return token.toFloat();
    }

    // Set your layout here. Anytime the size of obscurity of
    // the draw context is changed this will be called.
    function onLayout(dc as Dc) as Void {
        var obscurityFlags = DataField.getObscurityFlags();

        // Top left quadrant so we'll use the top left layout
        if (obscurityFlags == (OBSCURE_TOP | OBSCURE_LEFT)) {
            View.setLayout(Rez.Layouts.TopLeftLayout(dc));

        // Top right quadrant so we'll use the top right layout
        } else if (obscurityFlags == (OBSCURE_TOP | OBSCURE_RIGHT)) {
            View.setLayout(Rez.Layouts.TopRightLayout(dc));

        // Bottom left quadrant so we'll use the bottom left layout
        } else if (obscurityFlags == (OBSCURE_BOTTOM | OBSCURE_LEFT)) {
            View.setLayout(Rez.Layouts.BottomLeftLayout(dc));

        // Bottom right quadrant so we'll use the bottom right layout
        } else if (obscurityFlags == (OBSCURE_BOTTOM | OBSCURE_RIGHT)) {
            View.setLayout(Rez.Layouts.BottomRightLayout(dc));

        // Use the generic, centered layout
        } else {
            View.setLayout(Rez.Layouts.MainLayout(dc));
            var labelView = View.findDrawableById("label") as Text;
            labelView.locY = labelView.locY - 16;
            var valueView = View.findDrawableById("value") as Text;
            valueView.locY = valueView.locY + 7;
        }

        var labelView = View.findDrawableById("label") as Text;
        var labelText = Rez.Strings.label;
        if (mIntersectionCount > 0) {
            labelText = labelText + " (" + mIntersectionCount + ")";
        } else if (mPayloadString != null && mPayloadString.length() > 0) {
            labelText = labelText + " *";
        }
        labelView.setText(labelText);
    }

    // The given info object contains all the current workout information.
    // Calculate a value and save it locally in this method.
    // Note that compute() and onUpdate() are asynchronous, and there is no
    // guarantee that compute() will be called before onUpdate().
    function compute(info as Activity.Info) as Void {
        // See Activity.Info in the documentation for available information.
        if(info has :currentHeartRate){
            if(info.currentHeartRate != null){
                mValue = info.currentHeartRate as Number;
            } else {
                mValue = 0.0f;
            }
        }
    }

    // Display the value you computed here. This will be called
    // once a second when the data field is visible.
    function onUpdate(dc as Dc) as Void {
        loadPayloadFromSettings();

        // Set the background color
        (View.findDrawableById("Background") as Text).setColor(getBackgroundColor());

        // Update the label to show that payload settings are loaded
        var label = View.findDrawableById("label") as Text;
        var labelText = Rez.Strings.label;
        if (mIntersectionCount > 0) {
            labelText = labelText + " (" + mIntersectionCount + ")";
        } else if (mPayloadString != null && mPayloadString.length() > 0) {
            labelText = labelText + " *";
        }
        label.setText(labelText);

        // Set the foreground color and value
        var value = View.findDrawableById("value") as Text;
        if (getBackgroundColor() == Graphics.COLOR_BLACK) {
            value.setColor(Graphics.COLOR_WHITE);
        } else {
            value.setColor(Graphics.COLOR_BLACK);
        }
        value.setText(mValue.format("%.2f"));

        // Call parent's onUpdate(dc) to redraw the layout
        View.onUpdate(dc);
    }

}
