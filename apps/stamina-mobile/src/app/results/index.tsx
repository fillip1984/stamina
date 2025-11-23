import React from "react";
import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { ResultType } from "@stamina/api";

import Container from "~/components/ui/container";
import Typography from "~/components/ui/typography";
import { trpc } from "~/utils/api";

export default function ResultsPage() {
  const results = useQuery(trpc.result.findAll.queryOptions());
  return (
    <Container>
      <View className="flex gap-2">
        {results.data?.map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
      </View>
    </Container>
  );
}

const ResultCard = ({ result }: { result: ResultType }) => {
  if (result.bloodPressureReading) {
    return (
      <View className="rounded-lg border border-white p-2">
        <Typography variant={"heading"}>
          Blood Pressure: {result.bloodPressureReading.systolic}/
          {result.bloodPressureReading.diastolic} mmHg
        </Typography>
        <Typography variant={"muted"}>{format(result.date, "PPP")}</Typography>
      </View>
    );
  }

  if (result.weighIn) {
    return (
      <View className="flex-row rounded-lg border border-white p-2">
        <Ionicons name="scale-outline" size={24} color="white" />
        <Typography variant={"heading"}>
          Weight: {result.weighIn.weight} lbs
        </Typography>
        <Typography variant={"muted"}>{format(result.date, "PPP")}</Typography>
      </View>
    );
  }

  return (
    <View className="rounded-lg border border-white p-2">
      <Typography variant={"heading"}>{result.notes}</Typography>
      <Typography variant={"muted"}>{format(result.date, "PPP")}</Typography>
    </View>
  );
};
