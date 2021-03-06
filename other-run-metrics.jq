#!/usr/bin/env jq -rMf

# Extract other metrics from the run data

# Headers for resulting CSV
["TTFB", "First Contentful Paint", "Start Render", "DOM Complete" , "Fully Loaded"],
	# drill down into the runs data
	(
	.data.runs 
	# convert the run data into an object and drill down into the run request data
	| to_entries[].value.firstView 
	# build an array of the resulting data we want in the CSV
	| [.TTFB, .firstContentfulPaint, .render, .domComplete, .fullyLoaded]
	) 
	# pass to the CSV formatter
	| @csv
