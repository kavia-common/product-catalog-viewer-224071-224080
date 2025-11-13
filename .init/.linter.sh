#!/bin/bash
cd /home/kavia/workspace/code-generation/product-catalog-viewer-224071-224080/product_catalog_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

